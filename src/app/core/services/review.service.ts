import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { ReviewResponse, ReviewRequest } from '../model/review.model';

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
}
