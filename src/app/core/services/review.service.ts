import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { ReviewResponse, ReviewRequest } from '../model/review.model';

import { Page } from '../model/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getReviewsByProduct(productId: number): Observable<ReviewResponse[]> {
        return this.http.get<ReviewResponse[]>(`${this.apiUrl}/products/${productId}/reviews`);
    }

    addReview(productId: number, request: ReviewRequest): Observable<ReviewResponse> {
        return this.http.post<ReviewResponse>(`${this.apiUrl}/products/${productId}/reviews`, request);
    }

    deleteReview(reviewId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
    }

    // Admin APIs
    getAllReviewsAdmin(page: number = 0, size: number = 10): Observable<Page<ReviewResponse>> {
        return this.http.get<Page<ReviewResponse>>(`${this.apiUrl}/admin/reviews?page=${page}&size=${size}`);
    }

    deleteReviewAdmin(reviewId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/reviews/${reviewId}`);
    }
}
