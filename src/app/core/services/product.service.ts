import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductResponse } from '../model/product.model';
import { Page } from '../model/pagination.model';
import { ProductDetailResponse } from '../model/product-detail.model';
import { ProductRequest } from '../model/product-request.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = '/api/products';

    constructor(private http: HttpClient) { }

    getProducts(page: number = 0, size: number = 10): Observable<Page<ProductResponse>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<Page<ProductResponse>>(this.apiUrl, { params });
    }

    getProductById(id: number): Observable<ProductDetailResponse> {
        return this.http.get<ProductDetailResponse>(`${this.apiUrl}/${id}`);
    }

    addProduct(product: ProductRequest): Observable<string> {
        return this.http.post(this.apiUrl, product, { responseType: 'text' });
    }
}
