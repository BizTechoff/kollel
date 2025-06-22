import { Injectable } from '@angular/core';
import { UploadFileInfo, UploadFilesResult } from '../../shared/order.upload.type';
import { S3Service } from './s3.service';

@Injectable({
    providedIn: 'root',
})
export class UploadFileService {
    private isUploading = false
    allowImages = true

    constructor(private s3Service: S3Service) { }

    async onFileSelected(files: File[]): Promise<UploadFilesResult> {
        const result: UploadFilesResult = { success: false, message: '', files: [] as UploadFileInfo[] }

        if (!files?.length) {
            result.message = 'No files found'
            return result
        }

        const allowed= ['pdf','jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp','mp3', 'mp4'] as string[]
        const PromiseArray = []
        for (let i = 0; i < files.length; ++i) {

            // var continueMsg = `ממשיך לקובץ הבא`;
            // if (i < files.length - 1) {
            //     continueMsg = ''
            // }

            const f = files[i];
            const fileExtension = f.name.split(".").pop()?.toLowerCase() ?? '';
            if (!(allowed.includes(fileExtension))) {
                result.message = `רק קבצים מסוג '${allowed.join(', ')}' נתמכים, נא לבחור מחדש` //+ (files.length === 1 ? ', ' + continueMsg : '')
                // result.message += ` | ${fileExtension}`
                // alert(result.message);
                return result;
            }

            // הוספת ה-Promise למערך
            PromiseArray.push(this.uploadFile(f));
        }

        // המתנה לכל ההעלאות שיסתיימו
        try {
            const respones = await Promise.all(PromiseArray);
            console.log('respones', respones)
            result.files.push(...respones)
            result.success = true
            console.log("כל הקבצים הועלו בהצלחה!");
        } catch (error) {
            console.error("שגיאה בהעלאת קבצים:", error);
        }
        return result
    }

    private async uploadFile(file: File): Promise<UploadFileInfo> {
        const result: UploadFileInfo = { name: '', pages: 0, size: 0, type: '', url: '' }
        if (!file) {
            // alert('לא נבחר קובץ להעלאה');
            return result;
        }

        const f = file
        const split = f.name.split('.')
        const ext = split[split.length - 1]
        split.pop()
        const name = split.join('.')

        result.name = name
        result.size = f.size
        result.type = ext
        result.pages = 0
        result.url = ''

        // const fName = f.name;
        // const fType = f.type;
        // const fSize = f.size;

        this.isUploading = true;
        try {
            // Step 1: Get the signed URL
            const signedUrlresponse = await this.s3Service.getSignedUrl(
                result.name,
                result.type,
                '');
            if (signedUrlresponse.success) {
                // Step 2: Upload the file using the signed URL directly from client to S3
                await this.s3Service.uploadFileToS3(signedUrlresponse.url, f);
                // Step 3: Emit the URL after successful upload
                result.url = signedUrlresponse.url.split('?')[0]; // Remove query params to get the file URL


                // const media = remult.repo(Media).create({
                //   order: this.order,
                //   name: fileDetails.name,
                //   type: fileDetails.type,
                //   size: Math.round(fileDetails.size / 1024), // Convert bytes to KB
                //   link: fileDetails.url,
                //   seq: this.orderDocs.length + 1,
                //   pages: fileDetails.pages,
                //   device: fileDetails.device,
                //   docType: fileDetails.docxType
                // })


                console.info('File uploaded successfully!');
            }
            else {
                console.error('File uploaded error: ' + signedUrlresponse.error);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            // alert('Failed to upload file.');
        }
        finally {
            this.isUploading = false;
        }

        console.log('respones.result', result)
        return result
    }

    // ✅ פונקציה חדשה לפתיחת קבצים עם Signed URLs
    async openFile(fileName: string, fileExtension: string, bucketKey: string = 'casual'): Promise<boolean> {
        try {
            console.log('Opening file:', fileName, fileExtension, bucketKey);
            
            // קבל signed URL מהשרת
            const signedUrlResponse = await this.s3Service.getDownloadUrl(fileName, fileExtension, bucketKey);
            console.log('signedUrlResponse',signedUrlResponse.url)
            if (signedUrlResponse.success) {
                // פתח הקובץ בטאב חדש
                window.open(signedUrlResponse.url, '_blank');
                return true;
            } else {
                console.error('Failed to get signed URL:', signedUrlResponse.error);
                return false;
            }
        } catch (error) {
            console.error('Error opening file:', error);
            return false;
        }
    }

}
