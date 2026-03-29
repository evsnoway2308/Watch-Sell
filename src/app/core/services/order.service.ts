import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderRequest, PaymentSession } from '../model/order.model';
import { environment } from '../../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    /**
     * Tạo đơn hàng COD ngay lập tức.
     */
    createOrder(request: OrderRequest): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, request);
    }

    /**
     * Khởi tạo phiên thanh toán QR.
     * KHÔNG tạo đơn hàng - trả về QR URL và paymentRef.
     * Khi thanh toán thành công mới tạo đơn + trừ kho.
     */
    initiateQrPayment(orderRequest: OrderRequest, totalAmount: number): Observable<PaymentSession> {
        return this.http.post<PaymentSession>(`${this.apiUrl}/initiate-qr-payment`, {
            orderRequest,
            totalAmount
        });
    }

    /**
     * Kiểm tra trạng thái thanh toán QR.
     * Frontend poll mỗi 5 giây. Khi status = PAID → thành công.
     */
    checkPaymentStatus(paymentRef: string): Observable<PaymentSession> {
        return this.http.get<PaymentSession>(`${this.apiUrl}/check-payment/${paymentRef}`);
    }

    getMyOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
    }

    getOrderById(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }
}
