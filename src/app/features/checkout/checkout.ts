import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ModalService } from '../../core/services/modal.service';
import { CartResponse } from '../../core/model/cart.model';
import { PaymentSession } from '../../core/model/order.model';
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

    // QR Payment state
    showSepayModal = false;
    paymentSession: PaymentSession | null = null;

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
            next: (cart: CartResponse) => {
                this.cart = cart;
                if (!cart || cart.items.length === 0) {
                    this.router.navigate(['/cart']);
                }
            },
            error: (err: any) => {
                console.error('Error loading cart:', err);
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
            next: () => this.loadCart(),
            error: (err: any) => {
                console.error('Error updating quantity:', err);
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

        const formValue = this.checkoutForm.value;

        // Xây dựng order request
        const orderRequest: any = {
            shippingAddress: formValue.shippingAddress,
            phoneNumber: formValue.phoneNumber,
            notes: formValue.notes,
            paymentMethod: formValue.paymentMethod
        };

        if (this.directItem) {
            orderRequest.items = [{
                productId: this.directItem.id,
                quantity: this.directItem.selectedQuantity || 1
            }];
        }

        if (formValue.paymentMethod === 'BANK_TRANSFER') {
            // QR flow: tạo PaymentSession, chưa tạo đơn hàng
            this.initiateQrPayment(orderRequest);
        } else {
            // COD flow: tạo đơn hàng ngay
            this.createCodOrder(orderRequest);
        }
    }

    private initiateQrPayment(orderRequest: any): void {
        this.isLoading = true;
        const totalAmount = this.calculateTotal();

        this.orderService.initiateQrPayment(orderRequest, totalAmount).subscribe({
            next: (session: PaymentSession) => {
                this.isLoading = false;
                this.paymentSession = session;
                this.showSepayModal = true; // Hiện modal QR
            },
            error: (err: any) => {
                this.isLoading = false;
                console.error('Error initiating QR payment:', err);
                this.modalService.alert({
                    title: 'Lỗi',
                    message: 'Không thể khởi tạo thanh toán QR. Vui lòng thử lại.',
                    variant: 'danger'
                });
            }
        });
    }

    private createCodOrder(orderRequest: any): void {
        this.isLoading = true;

        this.orderService.createOrder(orderRequest).subscribe({
            next: (order: any) => {
                this.isLoading = false;
                this.modalService.alert({
                    title: 'Đặt hàng thành công! 🎉',
                    message: 'Cảm ơn bạn đã mua hàng! Chúng tôi sẽ liên hệ sớm nhất.'
                }).then(() => {
                    this.router.navigate(['/profile'], { queryParams: { tab: 'orders' } });
                });
            },
            error: (err: any) => {
                this.isLoading = false;
                console.error('Error creating COD order:', err);
                this.modalService.alert({
                    title: 'Lỗi đặt hàng',
                    message: 'Có lỗi xảy ra. Vui lòng thử lại.',
                    variant: 'danger'
                });
            }
        });
    }

    /**
     * Người dùng đóng modal QR / huỷ thanh toán.
     * Không có đơn hàng nào được tạo → quay về giỏ hàng.
     */
    onSepayCancelled(): void {
        this.showSepayModal = false;
        this.paymentSession = null;
        this.modalService.alert({
            title: 'Đã huỷ thanh toán',
            message: 'Bạn đã huỷ thanh toán. Đơn hàng chưa được tạo. Giỏ hàng của bạn vẫn còn nguyên.',
            variant: 'warning'
        }).then(() => {
            this.router.navigate(['/cart']); // Quay về giỏ hàng
        });
    }

    /**
     * Thanh toán thành công - gọi từ SepayPaymentComponent.
     */
    onPaymentSuccess(): void {
        this.showSepayModal = false;
        this.paymentSession = null;
    }
}