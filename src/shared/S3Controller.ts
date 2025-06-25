import { BackendMethod, Controller, ControllerBase } from 'remult';
import { ApiUrlResponse } from './api.type';

// require('aws-sdk') רץ רק בסביבת Node.js (בצד השרת)
// הדפדפן יתעלם משורה זו
const aws = require('aws-sdk');

// ממשקים משותפים לשני הצדדים
export interface S3UploadRequest {
    branch: string;
    fileName: string;
    fileType: string;
}

export interface S3UploadResponse {
    uploadUrl: string;
    key: string; // הנתיב המלא של הקובץ ב-S3
}

@Controller('s3')
export class S3Controller extends ControllerBase {

    // -------------------------------------------------------------------
    // מתודות שרצות בצד השרת (BACKEND)
    // -------------------------------------------------------------------

    private static createS3Client() {
        // ... (הקוד מפה לא השתנה)
        if (process.env['S3_CHANNEL_OPENED'] === 'true') {
            const region = process.env['AWS_S3_IAM_BTO_REGION'];
            const accessKeyId = process.env['AWS_S3_IAM_BTO_APP_ACCESS_KEY_ID'];
            const secretAccessKey = process.env['AWS_S3_IAM_BTO_APP_SECRET_ACCESS_KEY'];

            if (!region || !accessKeyId || !secretAccessKey) {
                console.error('s3Client.error: Missing required S3 environment variables.');
                return undefined;
            }

            return new aws.S3({
                region,
                accessKeyId,
                secretAccessKey,
                signatureVersion: 'v4'
            });
        } else {
            console.debug('s3Client.error: AWS-S3 Channel is Closed!!');
            return undefined;
        }
    }

    @BackendMethod({ allowed: true })
    static async generateUploadUrl(request: S3UploadRequest): Promise<ApiUrlResponse> {
        const result = {} as ApiUrlResponse
        // ... (הקוד מפה לא השתנה)
        const { v4: uuidv4 } = require('uuid');
        const id = uuidv4()

        const s3Client = S3Controller.createS3Client();
        if (!s3Client) {
            result.message = "S3 client is not available or configured."
            // throw new Error(result.message);
        }
        const BUCKET_NAME = process.env['AWS_S3_IAM_BTO_APP_BUCKET'];
        if (!BUCKET_NAME) {
            result.message = "Bucket name is not configured in environment variables."
            // throw new Error(result.message);
        }
        const FIXED_PREFIX = 'kollel/prod';
        const BRANCH_NAME = request.branch;
        const uniqueFileName = `${id}.${request.fileName.split('.').pop()}`;
        const key = `${FIXED_PREFIX}/${BRANCH_NAME}/${uniqueFileName}`;
        const s3Params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: 300,
            ContentType: request.fileType,
        };
        try {
            const uploadUrl = s3Client.getSignedUrl('putObject', s3Params);
            result.url = uploadUrl
            result.success = true
        } catch (error) {
            result.message = "Error creating pre-signed URL with SDK v2: " + error
            // throw new Error(result.message);
        }
        return result
    }


    // -------------------------------------------------------------------
    // מתודה שרצה בצד הלקוח (FRONTEND)
    // -------------------------------------------------------------------


    /**
     * מטפלת בהעלאה של קבצים מרובים.
     * מקבלת רשימת קבצים, מבקשת URL חתום לכל אחד, ומעלה אותם במקביל.
     * @param files רשימת קבצים מ- <input type="file" multiple>.
     * @param branch שם הסניף או התיקייה הרלוונטית.
     * @returns Promise שמחזיר אובייקט עם רשימת העלאות מוצלחות ונכשלות.
     */
    static async uploadFiles(files: FileList, branch: string) {
        const successfulUploads = []  as File[];
        const failedUploads: { file: File, error: any }[] = [];

        // שלב 1: איסוף כל הבקשות ליצירת URL-ים חתומים
        const urlPromises = Array.from(files).map(file => {
            return S3Controller.generateUploadUrl({
                branch,
                fileName: file.name,
                fileType: file.type,
            }).then(response => ({ ...response, file })); // נוסיף את הקובץ המקורי לתשובה
        });

        // המתן לכל ה-URLs מהשרת
        const urlResults = await Promise.allSettled(urlPromises);

        // שלב 2: איסוף כל בקשות ההעלאה עצמן
        const uploadPromises = urlResults.map(result => {
            if (result.status === 'fulfilled') {
                const { file, url, success, message } = result.value;

                // שימוש ב-fetch להעלאה עצמה
                return fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                }).then(response => {
                    if (response.ok) {
                        successfulUploads.push(file);
                    } else {
                        failedUploads.push({ file, error: new Error(`S3 upload failed with status ${response.status}`) });
                    }
                }).catch(error => {
                    failedUploads.push({ file, error });
                });
            } else {
                // אם קבלת ה-URL נכשלה, לא נוכל להעלות את הקובץ
                // (הקובץ המקורי לא זמין כאן ישירות, נצטרך לוגיקה מורכבת יותר אם נרצה לדעת איזה קובץ נכשל בשלב זה)
                console.error("Failed to get signed URL:", result.reason);
            }
            return Promise.resolve();
        });

        // המתן לסיום כל ההעלאות
        await Promise.all(uploadPromises);

        return { successfulUploads, failedUploads };
    }

}
