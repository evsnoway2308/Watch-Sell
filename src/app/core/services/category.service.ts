import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';
import { environment } from '../../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = `${environment.apiUrl}/categories`;

    constructor(private http: HttpClient) { }

    getCategories(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    getCategoryById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`);
    }

    addCategory(category: any): Observable<string> {
        return this.http.post(this.apiUrl, category, { responseType: 'text' });
    }

    updateCategory(id: number, category: any): Observable<string> {
        return this.http.put(`${this.apiUrl}/${id}`, category, { responseType: 'text' });
    }

    deleteCategory(id: number): Observable<string> {
        return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
    }
}
