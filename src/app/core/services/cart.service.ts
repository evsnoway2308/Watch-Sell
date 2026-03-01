import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartResponse } from '../model/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = '/api/cart';

    // Use a signal for reactive updates to the cart cross-component
    private cartSignal = signal<CartResponse | null>(null);
    cart = this.cartSignal.asReadonly();

    // Computed property for total item count
    itemCount = computed(() => {
        const cart = this.cartSignal();
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    constructor(private http: HttpClient) {
        // Initial load
        this.loadCart();
    }

    loadCart(): void {
        this.http.get<CartResponse>(this.apiUrl).subscribe({
            next: (cart) => this.cartSignal.set(cart),
            error: (err) => console.error('Error loading cart:', err)
        });
    }

    getCart(): Observable<CartResponse> {
        return this.http.get<CartResponse>(this.apiUrl).pipe(
            tap(cart => this.cartSignal.set(cart))
        );
    }

    addToCart(productId: number, quantity: number = 1): Observable<string> {
        const params = new HttpParams()
            .set('productId', productId.toString())
            .set('quantity', quantity.toString());

        return this.http.post(this.apiUrl + '/add', null, { params, responseType: 'text' }).pipe(
            tap(() => this.loadCart())
        );
    }

    updateQuantity(productId: number, quantity: number): Observable<string> {
        const params = new HttpParams()
            .set('productId', productId.toString())
            .set('quantity', quantity.toString());

        return this.http.put(this.apiUrl + '/update', null, { params, responseType: 'text' }).pipe(
            tap(() => this.loadCart())
        );
    }

    removeFromCart(productId: number): Observable<string> {
        return this.http.delete(`${this.apiUrl}/remove/${productId}`, { responseType: 'text' }).pipe(
            tap(() => this.loadCart())
        );
    }

    clearCart(): Observable<string> {
        return this.http.delete(this.apiUrl + '/clear', { responseType: 'text' }).pipe(
            tap(() => this.cartSignal.set(null))
        );
    }
}
