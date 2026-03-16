import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartResponse, CartItemResponse } from '../../core/model/cart.model';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './cart.html',
    styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
    cartData: CartResponse | null = null;
    isLoading = false;

    cartService = inject(CartService);

    constructor() { }

    ngOnInit(): void {
        this.isLoading = true;
        this.cartService.getCart().subscribe({
            next: (cart) => {
                this.cartData = cart;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching cart:', err);
                this.isLoading = false;
            }
        });
    }

    updateQuantity(item: CartItemResponse, newQuantity: number): void {
        if (newQuantity < 1 || newQuantity > item.productStock) return;
        this.cartService.updateQuantity(item.productId, newQuantity).subscribe({
            next: () => this.refreshCart(),
            error: (err) => {
                console.error('Error updating quantity:', err);
                this.refreshCart();
            }
        });
    }

    removeItem(productId: number): void {
        this.cartService.removeFromCart(productId).subscribe(() => {
            this.refreshCart();
        });
    }

    refreshCart(): void {
        this.cartService.getCart().subscribe(cart => this.cartData = cart);
    }

    trackByProductId(index: number, item: CartItemResponse): number {
        return item.productId;
    }
}
