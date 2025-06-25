import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, filter, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { S3Controller, S3UploadRequest } from '../../shared/S3Controller';
import { ApiUrlResponse } from '../../shared/api.type';

@Injectable({
    providedIn: 'root',
})
export class S3Service {
    // private generateSignedUrlEndpoint = '/api/s3/generateUploadURL' + `?key=${environment.SERVER_API_KEY}`; // Replace with your backend endpoint
    // private generateDownloadUrlEndpoint = '/api/s3/generateDownloadURL' + `?key=${environment.SERVER_API_KEY}`; // ✅ הוספה חדשה

    constructor(private http: HttpClient) { }

    // נניח שזו הפונקציה שלך לקבלת URL
    getSignedUrl(req: S3UploadRequest): Promise<ApiUrlResponse> {
        return S3Controller.generateUploadUrl(req);
    }

    /**
     * Upload the file to S3 using a signed URL.
     * @param signedUrl - The initial signed URL (can be null if resign is true)
     * @param file - The file to upload
     * @param resign - Whether to get a new signed URL before uploading
     * @returns An Observable that emits upload progress (0-100)
     */
    uploadFileToS3(signedUrl: string, file: File, branch: string, resign = false): Observable<number> {
        // בדיקה ראשונית של הקובץ. אם לא תקין, מחזירים Observable שזורק שגיאה.
        if (!file) {
            return throwError(() => new Error('File is null or undefined.'));
        }

        // שלב 1: יצירת Observable שמכיל את ה-URL.
        // אם resign=true, ניקח את ה-URL מהפונקציה הא-סינכרונית.
        // אם resign=false, פשוט נשתמש ב-URL שקיבלנו.
        const url$: Observable<string> = resign
            ? from(this.getSignedUrl({ fileName: file.name, fileType: file.type, branch })).pipe(
                map(res => res.url) // `from` הופך Promise ל-Observable
            )
            : of(signedUrl); // `of` הופך ערך רגיל ל-Observable

        // שלב 2: שימוש ב-pipe כדי לשרשר את פעולת ההעלאה אחרי שיש לנו URL.
        return url$.pipe(
            // switchMap הוא האופרטור המושלם למעבר מ-Observable אחד (של ה-URL)
            // ל-Observable אחר (של בקשת ה-HTTP).
            switchMap(url => {
                // בדיקת תקינות ל-URL שהתקבל
                if (!url?.trim().length) {
                    return throwError(() => new Error('Signed URL is null or undefined.'));
                }

                // בניית בקשת ה-PUT עם דיווח על התקדמות
                const req = new HttpRequest('PUT', url, file, {
                    reportProgress: true,
                    headers: new HttpHeaders({ 'Content-Type': file.type })
                });

                // החזרת ה-Observable של בקשת ההעלאה
                return this.http.request(req);
            }),
            // שלב 3: סינון ומיפוי האירועים של בקשת ה-HTTP לאחוזי התקדמות
            filter(event => event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response),
            map(event => {
                if (event.type === HttpEventType.UploadProgress) {
                    return Math.round(100 * event.loaded / (event.total || 1));
                } else {
                    return 100; // ההעלאה הסתיימה
                }
            }),
            // טיפול בשגיאות שעלולות להתרחש במהלך השרשור
            catchError(err => {
                console.error('Error during S3 upload process:', err);
                return throwError(() => new Error('Upload process failed.'));
            })
        );
    }

    // /**
    //  * ✅ Open file in new tab using signed URL
    //  * @param fileName - The name of the file to open
    //  * @param bucketKey - The bucket folder/key (default: 'casual')
    //  * @returns A Promise that resolves to success status
    //  */
    // async openFile(fileName: string, bucketKey: string = 'casual', fileType: string): Promise<boolean> {
    //     try {
    //         const response = await this.getDownloadUrl(fileName, bucketKey, fileType);

    //         if (response.success) {
    //             window.open(response.url, '_blank');
    //             return true;
    //         } else {
    //             console.error('Failed to get download URL:', response.error);
    //             return false;
    //         }
    //     } catch (error) {
    //         console.error('Error opening file:', error);
    //         return false;
    //     }
    // }

    /**
     * ✅ Get a signed URL from the server for downloading from S3.
     * @param fileName - The name of the file to download
     * @param bucketKey - The bucket folder/key (default: 'casual')
     * @returns A Promise that resolves to the signed URL for download
     */
    // getDownloadUrl(fileName: string, bucketKey: string = 'casual', fileType: string = ''): Promise<{ success: boolean, url: string, error: string }> {
    //     console.log('getDownloadUrl:', fileName, bucketKey, fileType);

    //     // ✅ בנה query parameters
    //     const params = new URLSearchParams({
    //         fileName: fileName,
    //         bucketKey: bucketKey,
    //         fileType: fileType
    //     });

    //     return this.http
    //         .get<{ success: boolean, url: string, error: string }>(
    //             `${this.generateDownloadUrlEndpoint}&${params.toString()}`
    //         )
    //         .toPromise()
    //         .then((response) => response!);
    // }

}
