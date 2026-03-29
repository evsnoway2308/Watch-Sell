export interface ReviewResponse {
    id: number;
    rating: number;
    comment: string;
    reviewDate: string;
    userName: string;
    userAvatar: string;
}

export interface ReviewRequest {
    rating: number;
    comment: string;
}
