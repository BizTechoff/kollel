
export interface ApiResponse {
    success: boolean,
    message: string
}

export interface ApiUrlResponse extends ApiResponse {
    url: string
}
