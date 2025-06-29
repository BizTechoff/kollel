import { Component, Input, OnInit } from '@angular/core';
import { remult } from 'remult';
import { S3UploadRequest } from '../../../shared/S3Controller';
import { S3Service } from '../s3.service';

// ייבוא המודלים של הישויות כדי שנוכל להעביר את ההקשר
import { MediaController } from '../../../shared/mediaController';
import { Branch } from '../../branches/branch';
import { UIToolsService } from '../../common/UIToolsService';
import { News } from '../../news/news';
import { Tenant } from '../../tenants/tenant';
import { User } from '../../users/user';
import { Visit } from '../../visits/visit';

// ממשק לניהול מצב של העלאת קובץ בודד
export interface FileUploadState {
  file: File;
  status: 'pending' | 'getting_url' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

@Component({
  selector: 'app-s3-uploader',
  templateUrl: './s3-uploader.component.html',
  styleUrls: ['./s3-uploader.component.scss']
})
export class S3UploaderComponent implements OnInit {
  // קבלת ההקשר מהקומפוננטה האב (לאיזה ישות לשייך את הקבצים)
  @Input() visit?: Visit;
  @Input() tenant?: Tenant;
  @Input() volunteer?: User;
  @Input() news?: News;
  @Input() addMediaEntity = true

  branch: Branch | null = null; // אותחל ל-null לבדיקה ברורה יותר
  branchName: string | null = null; // אותחל ל-null

  isDragging = false;
  uploadingCount = 0; // מונה שינהל כמה קבצים מועלים כרגע

  // מערך שמנהל את תור ההעלאות ואת המצב של כל קובץ
  uploadQueue: FileUploadState[] = [];

  constructor(private s3Service: S3Service, private ui: UIToolsService) { }

  async ngOnInit() {
    if (remult.user?.isManager && remult.user.branch) {
      try {
        this.branch = await remult.repo(Branch).findId(remult.user.branch);
        if (this.branch) {
          this.branchName = this.branch.email.trim().split('@')[0];
        }
      } catch (error) {
        console.error("Could not find branch", error);
      }
    }
  }

  // Getter פשוט שקובע אם המעלה מנוטרל
  public get isDisabled(): boolean {
    return !this.branch || this.uploadingCount > 0;
  }

  // --- לוגיקת גרירה ובחירת קבצים ---

  onDragOver(event: DragEvent) {
    if (this.isDisabled) return;
    this.preventDefaults(event);
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    this.preventDefaults(event);
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    if (this.isDisabled) return;
    this.preventDefaults(event);
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndHandleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    if (this.isDisabled) return;
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.validateAndHandleFiles(Array.from(files));
      input.value = ''; // איפוס כדי לאפשר בחירה חוזרת של אותו קובץ
    }
  }

  private validateAndHandleFiles(files: File[]) {
    const allowed = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp4', 'avi'];
    const validFiles = files.filter(f => {
      const type = f.type.trim().toLowerCase();
      return allowed.some(ext => type.includes(ext));
    });

    if (validFiles.length < files.length) {
      this.ui.yesNoQuestion('חלק מהקבצים אינם בפורמט תמונה או וידאו נתמך.', false);
    }

    if (validFiles.length > 0) {
      this.handleFiles(validFiles);
    }
  }

  private preventDefaults(e: DragEvent) { e.preventDefault(); e.stopPropagation(); }

  // --- לוגיקה מרכזית ---
  private handleFiles(files: File[]) {
    for (const file of files) {
      const uploadState: FileUploadState = {
        file: file,
        status: 'pending',
        progress: 0
      };
      this.uploadQueue.push(uploadState);
      this.startUploadProcess(uploadState);
    }
  }

  private async startUploadProcess(upload: FileUploadState) {
    upload.status = 'getting_url';

    try {
      // בדיקה שה-branch אכן נטען לפני השימוש בו
      if (!this.branch || !this.branchName) {
        throw new Error("Branch information is not available.");
      }

      const request: S3UploadRequest = {
        fileName: upload.file.name,
        fileType: upload.file.type,
        branchKey: this.branchName
      };

      const response = await this.s3Service.getSignedUrl(request);

      // שמירת ה-URL החתום במשתנה שיהיה זמין לכל אורך התהליך
      const signedUrl = response.url;

      upload.status = 'uploading';
      this.uploadingCount++; // הגדלת מונה ההעלאות הפעילות

      this.s3Service.uploadFileToS3(signedUrl, upload.file, this.branchName).subscribe({
        next: progress => {
          upload.progress = progress;
        },
        error: err => {
          let json = ''
          try { json = JSON.stringify(err) }
          catch { }
          this.uploadingCount--; // הקטנת המונה גם במקרה של שגיאה
          upload.status = 'error';
          upload.errorMessage = `העלאה ל-S3 נכשלה {file: '${upload.file.name}', err: '${err}', json: '${json}'}`;
          console.error(`S3 Upload failed for ${upload.file.name}:`, err);
        },
        complete: async () => {
          this.uploadingCount--; // הקטנת המונה בסיום מוצלח
          upload.progress = 100;
          upload.status = 'success';

          try {
            if (this.addMediaEntity) {
              // ה-URL הקבוע הוא החלק שלפני סימן השאלה
              const permanentUrl = signedUrl.split('?')[0];

              // שימוש במשתנים שזמינים כעת בסקופ הנכון
              await MediaController.createMediaRecord(
                this.branch!, // שימוש ב-! כי אנחנו יודעים שהוא קיים מהבדיקה למעלה
                this.visit,
                this.tenant,
                this.volunteer,
                this.news,
                '', // פרמטר ID ריק כפי שרצית
                permanentUrl, // הקישור הקבוע לקובץ
                upload.file.type
              );
            }

            // הסרת הפריט המוצלח מהתור לאחר השהייה קצרה
            setTimeout(() => {
              const i = this.uploadQueue.indexOf(upload);
              if (i >= 0) {
                this.uploadQueue.splice(i, 1);
              }
            }, 500);

          } catch (dbError) {
            upload.status = 'error';
            upload.errorMessage = 'שמירה ב-DB נכשלה';
            console.error(`DB record creation failed for ${upload.file.name}:`, dbError);
          }
        }
      });
    } catch (urlError) {
      upload.status = 'error';
      upload.errorMessage = 'נכשל בקבלת הרשאה';
      console.error(`Get signed URL failed for ${upload.file.name}:`, urlError);
    }
  }
}
