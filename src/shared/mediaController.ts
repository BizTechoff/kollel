import { BackendMethod, remult } from 'remult';
import { Branch } from '../app/branches/branch';
import { Media } from '../app/media/media';
import { MediaType } from '../app/media/mediaTypes';
import { S3Controller } from './S3Controller';
import { Visit } from '../app/visits/visit';
import { Tenant } from '../app/tenants/tenant';
import { User } from '../app/users/user';
import { News } from '../app/news/news';

interface FileUploadInfo {
    fileName: string;
    fileType: string;
    size: number;
}

// התשובה ללקוח - מכילה את כל מה שצריך להעלאה
interface UploadSlot {
    uploadUrl: string;
    mediaRecord: Media; // נחזיר את כל הרשומה שנוצרה
}

export class MediaController {

    

  static async createMediaRecord(branch:Branch, visit?:Visit, tenant?:Tenant, volunteer?:User, news?:News,
    id = '', link = '', type = '', taken?: Date) {
    var added = await remult.repo(Media).insert({
      branch: branch,
      visit: visit,
      tenant: tenant,
      volunteer: volunteer,
      news: news,
      type: type.includes('image') ? MediaType.photo : type.includes('video') ? MediaType.video : MediaType.excel,
      link: link,
      taken: taken,
      id: id
    })
    if (added && added.id === id && added.link === link) {
      return true
    }
    return false
  }

    @BackendMethod({ allowed: true }) // יש לאבטח לפי הצורך
    static async requestUploadSlots(branch: Branch, filesInfo: FileUploadInfo[]): Promise<UploadSlot[]> {
        const mediaRepo = remult.repo(Media);
        const response: UploadSlot[] = [];

        for (const fileInfo of filesInfo) {
            // קריאה ל-S3Controller לקבלת URL חתום ונתיב (key)

            let branchEngName = branch.email.trim().split('@')[0]
            // הנתיב ישמש אותנו כשדה 'link' בטבלה
            const { url } = await S3Controller.generateUploadUrl({
                branchKey: branchEngName,
                fileName: fileInfo.fileName,
                fileType: fileInfo.fileType,
            });

            // יצירת רשומה חדשה וסופית בטבלת Media עם כל הפרטים
            const newMediaEntry = await mediaRepo.insert({
                branch: branch, // מגיע מהפרמטרים
                link: url, // השדה שלך נקרא 'link', והוא יכיל את הנתיב מ-S3
                type: fileInfo.fileType.includes('image') ? MediaType.photo : fileInfo.fileType.includes('video') ? MediaType.video : MediaType.excel,
                // שדות כמו tenant ו-createdBy יתמלאו אוטומטית ע"י הדקורטורים שלך
            });

            // איסוף התוצאות שיישלחו חזרה ללקוח
            response.push({
                uploadUrl: url,
                mediaRecord: newMediaEntry
            });
        }
        return response;
    }
}
