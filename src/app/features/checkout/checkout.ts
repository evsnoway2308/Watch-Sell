import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ModalService } from '../../core/services/modal.service';
import { CartResponse } from '../../core/model/cart.model';
import { SepayPaymentComponent } from './sepay-payment/sepay-payment.component';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SepayPaymentComponent],
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
    checkoutForm: FormGroup;
    cart: CartResponse | null = null;
    isLoading = false;
    directItem: any = null;
    
    showSepayModal = false;
    createdOrder: any = null;

    constructor(
        private fb: FormBuilder,
        private cartService: CartService,
        private orderService: OrderService,
        private modalService: ModalService,
        private router: Router
    ) {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            this.directItem = navigation.extras.state['product'];
        }

        this.checkoutForm = this.fb.group({
            shippingAddress: ['', Validators.required],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            notes: [''],
            paymentMethod: ['COD', Validators.required]
        });
    }

    ngOnInit(): void {
        if (!this.directItem) {
            this.loadCart();
        }
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
        if (this.directItem) {
            return this.directItem.price * (this.directItem.selectedQuantity || 1);
        }
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
                this.modalService.alert({
                    title: 'Lỗi',
                    message: 'Có lỗi xảy ra khi cập nhật số lượng.',
                    variant: 'danger'
                });

            }
        });
    }

    onSubmit(): void {
        if (this.checkoutForm.invalid) return;
        if (!this.directItem && (!this.cart || this.cart.items.length === 0)) return;

        this.isLoading = true;
        const formValue = this.checkoutForm.value;
        const request: any = {
            shippingAddress: formValue.shippingAddress,
            phoneNumber: formValue.phoneNumber,
            notes: formValue.notes,
            paymentMethod: formValue.paymentMethod
        };

        if (this.directItem) {
            request.items = [{
                productId: this.directItem.id,
                quantity: this.directItem.selectedQuantity || 1
            }];
        }

        this.orderService.createOrder(request).subscribe({
            next: (order: any) => {
                this.isLoading = false;
                this.createdOrder = order;

                if (formValue.paymentMethod === 'BANK_TRANSFER') {
                    this.showSepayModal = true;
                } else {
                    this.handleOrderSuccess();
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                console.error('Error creating order:', err);
                this.modalService.alert({
                    title: 'Lỗi đặt hàng',
                    message: 'Có lỗi xảy ra khi đặt hàng. Vui lòng kiểm tra lại thông tin và thử lại.'
                });
            }
        });
    }

    handleOrderSuccess() {
        this.modalService.alert({
            title: 'Đặt hàng thành công',
            message: 'Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi!'
        }).then(() => {
            this.router.navigate(['/']);
        });
    }

    onSepayCancelled() {
        this.showSepayModal = false;
        this.modalService.alert({
            title: 'Thanh toán bị tạm dừng',
            message: 'Đơn hàng của bạn đã được tạo nhưng chưa thanh toán. Trạng thái đơn hàng sẽ cập nhật tự động khi bạn chuyển khoản sau.',
            variant: 'warning'
        }).then(() => {
            this.router.navigate(['/orders']); // Navigate to my orders
        });
    }
}
