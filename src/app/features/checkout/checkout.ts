import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ModalService } from '../../core/services/modal.service';
import { CartResponse } from '../../core/model/cart.model';
import { PaymentSession } from '../../core/model/order.model';
import { interval, Subscription, switchMap, takeWhile } from 'rxjs';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
    checkoutForm: FormGroup;
    cart: CartResponse | null = null;
    isLoading = false;

    // QR Payment state
    qrPaymentStep: 'form' | 'qr' | 'success' = 'form';
    paymentSession: PaymentSession | null = null;
    qrPollingSubscription: Subscription | null = null;
    qrCountdown = 0;
    countdownInterval: any = null;
    qrCheckingStatus = false;

    constructor(
        private fb: FormBuilder,
        private cartService: CartService,
        private orderService: OrderService,
        private modalService: ModalService,
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

    ngOnDestroy(): void {
        this.stopPolling();
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

    get selectedPaymentMethod(): string {
        return this.checkoutForm.get('paymentMethod')?.value || 'COD';
    }

    onSubmit(): void {
        if (this.checkoutForm.invalid || !this.cart) return;

        if (this.selectedPaymentMethod === 'BANK_TRANSFER') {
            this.initiateQrPayment();
        } else {
            this.createCodOrder();
        }
    }

    // ===================== COD Flow =====================

    createCodOrder(): void {
        this.isLoading = true;
        const request = this.checkoutForm.value;

        this.orderService.createOrder(request).subscribe({
            next: (order) => {
                this.isLoading = false;
                this.modalService.alert({
                    title: 'Đặt hàng thành công! 🎉',
                    message: 'Đơn hàng COD của bạn đã được tạo. Cảm ơn bạn đã tin tưởng mua sắm!'
                }).then(() => {
                    this.router.navigate(['/profile'], { queryParams: { tab: 'orders' } });
                });
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error creating order:', err);
                this.modalService.alert({
                    title: 'Lỗi đặt hàng',
                    message: 'Có lỗi xảy ra khi đặt hàng. Vui lòng kiểm tra lại thông tin và thử lại.'
                });
            }
        });
    }

    // ===================== QR Payment Flow =====================

    initiateQrPayment(): void {
        if (this.checkoutForm.invalid || !this.cart) return;
        this.isLoading = true;

        const request = {
            shippingAddress: this.checkoutForm.value.shippingAddress,
            phoneNumber: this.checkoutForm.value.phoneNumber,
            notes: this.checkoutForm.value.notes,
            paymentMethod: this.checkoutForm.value.paymentMethod
        };

        const totalAmount = this.calculateTotal();

        this.orderService.initiateQrPayment(request, totalAmount).subscribe({
            next: (session) => {
                this.isLoading = false;
                this.paymentSession = session;
                this.qrPaymentStep = 'qr';
                this.qrCountdown = session.expiresInSeconds;
                this.startCountdown();
                this.startPolling(session.paymentRef);
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error initiating QR payment:', err);
                this.modalService.alert({
                    title: 'Lỗi khởi tạo thanh toán',
                    message: 'Không thể tạo mã QR. Vui lòng thử lại.'
                });
            }
        });
    }

    startPolling(paymentRef: string): void {
        // Poll every 5 seconds
        this.qrPollingSubscription = interval(5000).pipe(
            switchMap(() => {
                this.qrCheckingStatus = true;
                return this.orderService.checkPaymentStatus(paymentRef);
            }),
            takeWhile((session) => session.status === 'PENDING', true)
        ).subscribe({
            next: (session) => {
                this.qrCheckingStatus = false;
                this.paymentSession = session;

                if (session.status === 'PAID') {
                    this.stopPolling();
                    this.onQrPaymentSuccess();
                } else if (session.status === 'EXPIRED') {
                    this.stopPolling();
                    this.onQrPaymentExpired();
                }
            },
            error: (err) => {
                this.qrCheckingStatus = false;
                console.error('Error checking payment status:', err);
            }
        });
    }

    stopPolling(): void {
        if (this.qrPollingSubscription) {
            this.qrPollingSubscription.unsubscribe();
            this.qrPollingSubscription = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    startCountdown(): void {
        this.countdownInterval = setInterval(() => {
            if (this.qrCountdown > 0) {
                this.qrCountdown--;
            } else {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    get countdownDisplay(): string {
        const minutes = Math.floor(this.qrCountdown / 60);
        const seconds = this.qrCountdown % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    onQrPaymentSuccess(): void {
        this.qrPaymentStep = 'success';
        this.stopPolling();
    }

    onQrPaymentExpired(): void {
        this.modalService.alert({
            title: 'Phiên thanh toán đã hết hạn',
            message: 'Mã QR đã hết hiệu lực. Vui lòng thử lại.'
        }).then(() => {
            this.qrPaymentStep = 'form';
            this.paymentSession = null;
        });
    }

    cancelQrPayment(): void {
        this.stopPolling();
        this.qrPaymentStep = 'form';
        this.paymentSession = null;
    }

    goToOrders(): void {
        this.router.navigate(['/profile'], { queryParams: { tab: 'orders' } });
    }
}
