
export interface UploadFilesResult {
    success: boolean,
    message: string,
    files: UploadFileInfo[]
}

export interface UploadFileInfo {
    name: string,
    type: string,
    size: number,
    pages: number,
    url: string
};
