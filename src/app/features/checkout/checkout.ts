import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { CartResponse } from '../../core/model/cart.model';
import { Order } from '../../core/model/order.model';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
    checkoutForm: FormGroup;
    cart: CartResponse | null = null;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private cartService: CartService,
        private orderService: OrderService,
        private router: Router
    ) {
        this.checkoutForm = this.fb.group({
            shippingAddress: ['', Validators.required],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            notes: [''],
            paymentMethod: ['COD', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadCart();
    }

    loadCart(): void {
        this.cartService.getCart().subscribe({
            next: (cart) => {
                this.cart = cart;
                if (!cart || cart.items.length === 0) {
                    this.router.navigate(['/cart']);
                }
            },
            error: (err) => {
                console.error('Error loading cart for checkout:', err);
            }
        });
    }

    calculateTotal(): number {
        if (!this.cart) return 0;
        return this.cart.items.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
    }

    onQuantityChange(productId: number, newQuantity: number): void {
        if (newQuantity < 1) return;

        this.cartService.updateQuantity(productId, newQuantity).subscribe({
            next: () => {
                this.loadCart();
            },
            error: (err) => {
                console.error('Error updating quantity in checkout:', err);
                alert('Có lỗi xảy ra khi cập nhật số lượng.');
            }
        });
    }

    onSubmit(): void {
        if (this.checkoutForm.invalid || !this.cart) return;

        this.isLoading = true;
        const request = this.checkoutForm.value;

        this.orderService.createOrder(request).subscribe({
            next: (order) => {
                this.isLoading = false;
                alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error creating order:', err);
                alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
            }
        });
    }
}
