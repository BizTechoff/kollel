import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class S3Service {
    private generateSignedUrlEndpoint = '/api/s3/generateUploadURL' + `?key=${environment.SERVER_API_KEY}`; // Replace with your backend endpoint
    private generateDownloadUrlEndpoint = '/api/s3/generateDownloadURL' + `?key=${environment.SERVER_API_KEY}`; // ✅ הוספה חדשה

    constructor(private http: HttpClient) { }

    /**
     * Get a signed URL from the server for uploading to S3.
     * @param fileName - The name of the file to upload
     * @param fileType - The MIME type of the file
     * @returns A Promise that resolves to the signed URL
     */
    getSignedUrl(fileName: string, fileType: string, bucketKey: string): Promise<{ success: false, url: '', error: '' }> {
        console.log('getSignedUrl:', fileName, fileType, bucketKey);
        return this.http
            .post<{ success: false, url: '', error: '' }>(this.generateSignedUrlEndpoint, { fileName, fileType, bucketKey })
            .toPromise()
            .then((response) => response!);
    }

    /**
     * Upload the file to S3 using a signed URL.
     * @param signedUrl - The signed URL for S3
     * @param file - The file to upload
     * @param fileType - The MIME type of the file
     * @returns A Promise that resolves when the upload is complete
     */
    async uploadFileToS3(signedUrl: string, file: File, resign = false): Promise<void> {

        if (!file) {
            console.error('File is null or undefined in uploadFileToS3');
            return Promise.reject(new Error('File is null or undefined.'));
        }

        if (resign) {
            const res = await this.getSignedUrl(file.name, file.type, 'customer')
            if (res.success) {
                signedUrl = res.url;
            } else {
                console.error('getSignedUrl failed:', res.error);
                return Promise.reject(new Error('Failed to get signed URL'));
            }
        }

        if (!signedUrl?.trim().length) {
            console.error('Signed URL is null or undefined in uploadFileToS3');
            return Promise.reject(new Error('Signed URL is null or undefined.'));
        }

        const fName = file.name;
        const fType = file.type;

        return this.http
            .put(signedUrl, file, {
                headers: {
                    'Content-Type': fType,
                },
            })
            .toPromise()
            .then(() => {
                console.log('uploadFileToS3', 'File uploaded successfully');
            }).catch((error) => {
                console.log('uploadFileToS3', 'File uploaded UN successfully: ' + JSON.stringify(error));
            })
    }

    /**
     * ✅ Open file in new tab using signed URL
     * @param fileName - The name of the file to open
     * @param bucketKey - The bucket folder/key (default: 'casual')
     * @returns A Promise that resolves to success status
     */
    async openFile(fileName: string, bucketKey: string = 'casual', fileType: string): Promise<boolean> {
        try {
            const response = await this.getDownloadUrl(fileName, bucketKey, fileType);

            if (response.success) {
                window.open(response.url, '_blank');
                return true;
            } else {
                console.error('Failed to get download URL:', response.error);
                return false;
            }
        } catch (error) {
            console.error('Error opening file:', error);
            return false;
        }
    }

    /**
     * ✅ Get a signed URL from the server for downloading from S3.
     * @param fileName - The name of the file to download
     * @param bucketKey - The bucket folder/key (default: 'casual')
     * @returns A Promise that resolves to the signed URL for download
     */
    getDownloadUrl(fileName: string, bucketKey: string = 'casual', fileType: string = ''): Promise<{ success: boolean, url: string, error: string }> {
        console.log('getDownloadUrl:', fileName, bucketKey, fileType);

        // ✅ בנה query parameters
        const params = new URLSearchParams({
            fileName: fileName,
            bucketKey: bucketKey,
            fileType: fileType
        });

        return this.http
            .get<{ success: boolean, url: string, error: string }>(
                `${this.generateDownloadUrlEndpoint}&${params.toString()}`
            )
            .toPromise()
            .then((response) => response!);
    }

}
