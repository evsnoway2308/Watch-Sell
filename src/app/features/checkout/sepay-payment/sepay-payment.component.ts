import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal.service';
import { Order } from '../../../core/model/order.model';

@Component({
    selector: 'app-sepay-payment',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="sepay-overlay">
        <div class="sepay-modal">
            <div class="sepay-header">
                <h2>Thanh toán chuyển khoản</h2>
                <p class="order-ref">Đơn hàng #{{ order?.id }}</p>
            </div>
            
            <div class="sepay-body">
                <div class="sepay-split-container">
                    <!-- Left Column: QR Code -->
                    <div class="qr-column">
                        <div class="qr-wrapper">
                            <img *ngIf="order?.qrCodeUrl" [src]="order?.qrCodeUrl" alt="Mã thanh toán QR" class="qr-image">
                            <div class="qr-placeholder" *ngIf="!order?.qrCodeUrl">
                                <div class="spinner-large"></div>
                                <p>Đang tạo mã QR...</p>
                            </div>
                        </div>
                        <div class="payment-status">
                            <div class="pulse-indicator" *ngIf="orderStatus !== 'PAID'"></div>
                            <i class="fas fa-check-circle" *ngIf="orderStatus === 'PAID'"></i>
                            <span>{{ getStatusText() }}</span>
                        </div>
                    </div>

                    <!-- Right Column: Payment Details -->
                    <div class="details-column">
                        <div class="info-group">
                            <div class="info-label">Số tiền cần thanh toán</div>
                            <div class="info-value amount">{{ order?.totalAmount | currency:'VND':'symbol':'1.0-0' }}</div>
                        </div>

                        <div class="bank-card">
                            <div class="bank-info">
                                <span class="bank-name">Ngân hàng BIDV</span>
                                <span class="account-holder">NGUYEN DUC KHANH</span>
                            </div>
                            
                            <div class="account-details">
                                <div class="detail-row">
                                    <span class="label">Số tài khoản</span>
                                    <div class="value-group">
                                        <span class="value mono">450630423</span>
                                        <button class="copy-icon-btn" (click)="copyToClipboard('450630423', 'Số tài khoản')" title="Sao chép">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="detail-row highlight-row">
                                    <span class="label">Nội dung chuyển khoản</span>
                                    <div class="value-group">
                                        <span class="value highlight mono">{{ order?.paymentRef || 'N/A' }}</span>
                                        <button class="copy-icon-btn active" (click)="copyToClipboard(order?.paymentRef || '', 'Nội dung')" title="Sao chép">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="instructions">
                            <div class="inst-item">
                                <i class="fas fa-info-circle"></i>
                                <span>Vui lòng nhập <strong>chính xác nội dung</strong> để hệ thống tự động xác nhận đơn hàng sau 1-3 phút.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sepay-footer">
                <button type="button" class="btn-cancel" (click)="onCancel()">Quay lại</button>
            </div>
        </div>
    </div>
    `,
    styles: [`
    .sepay-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.9);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
        backdrop-filter: blur(12px);
    }
    .sepay-modal {
        background: #ffffff;
        width: 95%;
        max-width: 850px;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25);
        animation: modalFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        color: #1e293b;
    }
    @keyframes modalFadeUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .sepay-header {
        background: #1e293b;
        color: white;
        padding: 32px 40px;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .sepay-header h2 { margin: 0; font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em; }
    .order-ref { margin: 8px 0 0; color: #94a3b8; font-size: 0.9rem; font-family: 'Space Mono', monospace; }
    
    .sepay-body { padding: 40px; }
    .sepay-split-container { display: flex; gap: 4rem; }
    
    /* Left Column */
    .qr-column { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .qr-wrapper {
        width: 280px;
        height: 280px;
        background: white;
        padding: 16px;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
        margin-bottom: 24px;
        display: flex; align-items: center; justify-content: center;
    }
    .qr-image { width: 100%; height: 100%; object-fit: contain; }
    .spinner-large {
        width: 40px; height: 40px;
        border: 3px solid #f1f5f9;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }
    .payment-status {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 24px; border-radius: 40px;
        background: #f0fdf4; border: 1px solid #dcfce7;
        color: #166534; font-weight: 600; font-size: 0.95rem;
    }
    .pulse-indicator {
        width: 10px; height: 10px; background: #22c55e;
        border-radius: 50%; animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
        100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Right Column */
    .details-column { flex: 1.2; display: flex; flex-direction: column; gap: 2rem; }
    .info-group .info-label { color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
    .info-value.amount { font-size: 2.2rem; font-weight: 800; color: #1e293b; letter-spacing: -0.03em; }

    .bank-card {
        background: #f8fafc; border: 1px solid #e2e8f0;
        border-radius: 20px; padding: 24px;
    }
    .bank-info { display: flex; flex-direction: column; margin-bottom: 24px; }
    .bank-name { font-size: 1.2rem; font-weight: 700; color: #1e293b; }
    .account-holder { font-size: 0.9rem; color: #64748b; margin-top: 4px; }
    
    .account-details { display: flex; flex-direction: column; gap: 1.5rem; }
    .detail-row { display: flex; flex-direction: column; gap: 8px; }
    .detail-row .label { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
    .value-group { display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .value.mono { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 1.1rem; color: #1e293b; }
    .value.highlight { color: #3b82f6; }
    .highlight-row .value-group { background: #eff6ff; border-color: #bfdbfe; }
    .highlight-row .value.highlight { color: #2563eb; }

    .copy-icon-btn {
        background: transparent; border: none; color: #94a3b8; cursor: pointer;
        font-size: 1.1rem; transition: all 0.2s; padding: 4px;
    }
    .copy-icon-btn:hover { color: #3b82f6; transform: scale(1.1); }
    .copy-icon-btn.active { color: #3b82f6; }

    .instructions { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 16px; }
    .inst-item { display: flex; gap: 12px; color: #92400e; font-size: 0.85rem; line-height: 1.6; }
    .inst-item i { margin-top: 3px; font-size: 1rem; }

    .sepay-footer { padding: 24px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: right; }
    .btn-cancel {
        background: white; border: 1px solid #e2e8f0; color: #475569;
        padding: 12px 32px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }

    @media (max-width: 768px) {
        .sepay-split-container { flex-direction: column; gap: 2.5rem; }
        .sepay-body { padding: 24px; }
        .sepay-header { padding: 24px; }
        .details-column { gap: 1.5rem; }
        .info-value.amount { font-size: 1.8rem; }
        .qr-wrapper { width: 240px; height: 240px; }
    }
    `]
})
export class SepayPaymentComponent implements OnInit, OnDestroy {
    @Input() order: Order | null = null;
    @Output() cancelled = new EventEmitter<void>();

    orderStatus: string = 'PENDING';
    pollingInterval: any;

    constructor(
        private orderService: OrderService,
        private router: Router,
        private modalService: ModalService
    ) {}

    ngOnInit() {
        this.startPolling();
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    startPolling() {
        // Kiểm tra ngay lần đầu khi mở modal
        if (this.order && this.order.id) {
            this.checkOrderStatus();
        }
        this.pollingInterval = setInterval(() => {
            if (this.order && this.order.id) {
                this.checkOrderStatus();
            }
        }, 5000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    checkOrderStatus() {
        if (!this.order || this.orderStatus === 'PAID') return; // Dừng nếu đã PAID
        this.orderService.getOrderById(this.order.id).subscribe({
            next: (order) => {
                this.orderStatus = order.status;
                if (order.status === 'PAID') {
                    this.stopPolling(); // Dừng polling ngay khi phát hiện PAID
                    this.handlePaymentSuccess();
                }
            },
            error: (err) => {
                console.error('Error polling order status:', err);
            }
        });
    }

    handlePaymentSuccess() {
        this.modalService.alert({
            title: '✅ Thanh toán thành công!',
            message: 'Hệ thống đã xác nhận thanh toán. Đơn hàng của bạn đang được xử lý!',
            variant: 'success'
        }).then(() => {
            this.router.navigate(['/profile'], { queryParams: { tab: 'orders' } });
        });
    }

    getStatusText(): string {
        return this.orderStatus === 'PAID' ? 'Đã nhận thanh toán' : 'Hệ thống đang chờ thanh toán… Vui lòng không đóng trang này.';
    }

    copyToClipboard(text: string, label: string) {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            // Lặng lẽ sao chép
            console.log(`${label} copied!`);
        });
    }

    onCancel() {
        this.cancelled.emit();
    }
}
