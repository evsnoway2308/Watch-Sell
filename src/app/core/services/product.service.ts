import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductResponse } from '../model/product.model';
import { Page } from '../model/pagination.model';
import { ProductDetailResponse } from '../model/product-detail.model';
import { ProductRequest } from '../model/product-request.model';
import { environment } from '../../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;
    private uploadUrl = `${environment.apiUrl}/upload`;

    constructor(private http: HttpClient) { }

    getProducts(page: number = 0, size: number = 10, categoryId?: number, keyword?: string): Observable<Page<ProductResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
    
        if (categoryId !== undefined && categoryId !== null) {
            params = params.set('categoryId', categoryId.toString());
        }

        if (keyword) {
            params = params.set('keyword', keyword);
        }
    
        return this.http.get<Page<ProductResponse>>(this.apiUrl, { params });
    }

    getProductById(id: number): Observable<ProductDetailResponse> {
        return this.http.get<ProductDetailResponse>(`${this.apiUrl}/${id}`);
    }

    addProduct(product: ProductRequest): Observable<string> {
        return this.http.post(this.apiUrl, product, { responseType: 'text' });
    }

    updateProduct(id: number, product: ProductRequest): Observable<string> {
        return this.http.put(`${this.apiUrl}/${id}`, product, { responseType: 'text' });
    }

    deleteProduct(id: number): Observable<string> {
        return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
    }

    uploadProductImage(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${this.uploadUrl}/product`, formData);
    }
}
