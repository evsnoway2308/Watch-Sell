import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderRequest } from '../model/order.model';
import { environment } from '../../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    /**
     * Tạo đơn hàng.
     * - COD: order.status = PENDING, không có qrCodeUrl
     * - BANK_TRANSFER: order.status = PENDING, có qrCodeUrl + paymentRef
     *   → SepayPaymentComponent sẽ hiển thị QR và poll getOrderById mỗi 5s
     */
    createOrder(request: OrderRequest): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, request);
    }

    /**
     * Lấy thông tin đơn hàng theo ID.
     * Dùng bởi SepayPaymentComponent để polling trạng thái thanh toán.
     */
    getOrderById(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    getMyOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
    }
}
