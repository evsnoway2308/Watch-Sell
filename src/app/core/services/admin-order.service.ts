import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        imageUrl: string;
        price: number;
    };
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    orderDate: string;
    totalAmount: number;
    status: string;
    shippingAddress: string;
    phoneNumber: string;
    notes: string;
    paymentMethod: string;
    user: {
        id: number;
        username: string;
        name: string;
    };
    orderItems: OrderItem[];
}

@Injectable({
    providedIn: 'root'
})
export class AdminOrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl);
    }

    updateOrderStatus(orderId: number, status: string): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, status);
    }
}
