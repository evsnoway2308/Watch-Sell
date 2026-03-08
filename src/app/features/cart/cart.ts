import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ModalService } from '../../core/services/modal.service';
import { CartResponse } from '../../core/model/cart.model';

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
    modalService = inject(ModalService);

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

    updateQuantity(productId: number, quantity: number): void {
        if (quantity < 1) return;
        this.cartService.updateQuantity(productId, quantity).subscribe(() => {
            this.refreshCart();
        });
    }

    async removeItem(productId: number): Promise<void> {
        const confirmed = await this.modalService.confirm({
            title: 'Xóa sản phẩm',
            message: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?',
            confirmText: 'Xóa ngay',
            cancelText: 'Hủy'
        });

        if (confirmed) {
            this.cartService.removeFromCart(productId).subscribe(() => {
                this.refreshCart();
            });
        }
    }

    refreshCart(): void {
        this.cartService.getCart().subscribe(cart => this.cartData = cart);
    }
}
