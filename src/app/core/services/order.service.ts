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

    createOrder(request: OrderRequest): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, request);
    }

    /**
     * Initiate a QR payment session.
     * Does NOT create order - returns QR URL and paymentRef for polling.
     */
    initiateQrPayment(orderRequest: OrderRequest, totalAmount: number): Observable<PaymentSession> {
        return this.http.post<PaymentSession>(`${this.apiUrl}/initiate-qr-payment`, {
            orderRequest,
            totalAmount
        });
    }

    /**
     * Poll payment status by paymentRef.
     */
    checkPaymentStatus(paymentRef: string): Observable<PaymentSession> {
        return this.http.get<PaymentSession>(`${this.apiUrl}/check-payment/${paymentRef}`);
    }

    getMyOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
    }
}
