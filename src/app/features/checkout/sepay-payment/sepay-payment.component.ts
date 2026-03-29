import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal.service';
import { PaymentSession } from '../../../core/model/order.model';

@Component({
    selector: 'app-sepay-payment',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="sepay-overlay">
        <div class="sepay-modal">
            <div class="sepay-header">
                <h2>Thanh toán chuyển khoản</h2>
                <p class="order-ref">Mã thanh toán: {{ paymentSession?.paymentRef }}</p>
            </div>
            
            <div class="sepay-body">
                <div class="sepay-split-container">
                    <!-- Left Column: QR Code -->
                    <div class="qr-column">
                        <div class="qr-wrapper">
                            <img *ngIf="paymentSession?.qrCodeUrl" 
                                 [src]="paymentSession?.qrCodeUrl" 
                                 alt="Mã QR thanh toán" class="qr-image">
                            <div class="qr-placeholder" *ngIf="!paymentSession?.qrCodeUrl">
                                <div class="spinner-large"></div>
                                <p>Đang tạo mã QR...</p>
                            </div>
                        </div>
                        <div class="payment-status" [class.paid]="paymentStatus === 'PAID'">
                            <div class="pulse-indicator" *ngIf="paymentStatus !== 'PAID'"></div>
                            <span class="check-icon" *ngIf="paymentStatus === 'PAID'">✅</span>
                            <span>{{ getStatusText() }}</span>
                        </div>
                    </div>

                    <!-- Right Column: Payment Details -->
                    <div class="details-column">
                        <div class="info-group">
                            <div class="info-label">Số tiền cần thanh toán</div>
                            <div class="info-value amount">{{ paymentSession?.amount | currency:'VND':'symbol':'1.0-0' }}</div>
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
                                        <span class="value mono">96247111204</span>
                                        <button class="copy-icon-btn" (click)="copyToClipboard('96247111204', 'Số tài khoản')" title="Sao chép">
                                            📋
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="detail-row highlight-row">
                                    <span class="label">Nội dung chuyển khoản (bắt buộc)</span>
                                    <div class="value-group">
                                        <span class="value highlight mono">{{ paymentSession?.paymentRef || 'N/A' }}</span>
                                        <button class="copy-icon-btn active" (click)="copyToClipboard(paymentSession?.paymentRef || '', 'Nội dung')" title="Sao chép">
                                            📋
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="instructions">
                            <div class="inst-item">
                                <span>ℹ️</span>
                                <span>Vui lòng nhập <strong>chính xác nội dung chuyển khoản</strong> để hệ thống tự động xác nhận. Đơn hàng sẽ được tạo sau 1-3 phút kể từ khi nhận được thanh toán.</span>
                            </div>
                        </div>

                        <div class="expire-info" *ngIf="remainingSeconds > 0">
                            ⏱ Mã QR hết hạn sau: <strong>{{ formatTime(remainingSeconds) }}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sepay-footer">
                <button type="button" class="btn-cancel" (click)="onCancel()">
                    ← Quay lại giỏ hàng
                </button>
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
    .order-ref { margin: 8px 0 0; color: #94a3b8; font-size: 0.9rem; font-family: monospace; }
    
    .sepay-body { padding: 40px; }
    .sepay-split-container { display: flex; gap: 4rem; }
    
    .qr-column { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .qr-wrapper {
        width: 280px; height: 280px;
        background: white; padding: 16px;
        border-radius: 20px; border: 1px solid #e2e8f0;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
        margin-bottom: 24px;
        display: flex; align-items: center; justify-content: center;
    }
    .qr-image { width: 100%; height: 100%; object-fit: contain; }
    .spinner-large {
        width: 40px; height: 40px;
        border: 3px solid #f1f5f9; border-top-color: #3b82f6;
        border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;
    }
    .payment-status {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 24px; border-radius: 40px;
        background: #f0fdf4; border: 1px solid #dcfce7;
        color: #166534; font-weight: 600; font-size: 0.95rem;
    }
    .payment-status.paid {
        background: #dcfce7; border-color: #16a34a;
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

    .details-column { flex: 1.2; display: flex; flex-direction: column; gap: 1.5rem; }
    .info-group .info-label { color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
    .info-value.amount { font-size: 2.2rem; font-weight: 800; color: #1e293b; letter-spacing: -0.03em; }

    .bank-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; }
    .bank-info { display: flex; flex-direction: column; margin-bottom: 24px; }
    .bank-name { font-size: 1.2rem; font-weight: 700; color: #1e293b; }
    .account-holder { font-size: 0.9rem; color: #64748b; margin-top: 4px; }
    
    .account-details { display: flex; flex-direction: column; gap: 1.5rem; }
    .detail-row { display: flex; flex-direction: column; gap: 8px; }
    .detail-row .label { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
    .value-group { display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .value.mono { font-family: monospace; font-weight: 700; font-size: 1.1rem; color: #1e293b; }
    .value.highlight { color: #3b82f6; }
    .highlight-row .value-group { background: #eff6ff; border-color: #bfdbfe; }

    .copy-icon-btn { background: transparent; border: none; cursor: pointer; font-size: 1rem; transition: all 0.2s; padding: 4px; }
    .copy-icon-btn:hover { transform: scale(1.2); }

    .instructions { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 16px; }
    .inst-item { display: flex; gap: 12px; color: #92400e; font-size: 0.85rem; line-height: 1.6; }

    .expire-info { text-align: center; color: #64748b; font-size: 0.9rem; background: #f8fafc; padding: 10px; border-radius: 10px; }

    .sepay-footer { padding: 24px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .btn-cancel {
        background: white; border: 1px solid #e2e8f0; color: #475569;
        padding: 12px 32px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }

    @media (max-width: 768px) {
        .sepay-split-container { flex-direction: column; gap: 2.5rem; }
        .sepay-body { padding: 24px; }
        .sepay-header { padding: 24px; }
        .info-value.amount { font-size: 1.8rem; }
        .qr-wrapper { width: 240px; height: 240px; }
    }
    `]
})
export class SepayPaymentComponent implements OnInit, OnDestroy {
    @Input() paymentSession: PaymentSession | null = null;
    @Output() cancelled = new EventEmitter<void>();
    @Output() paymentSuccess = new EventEmitter<void>();

    paymentStatus: string = 'PENDING';
    remainingSeconds: number = 900; // 15 phút
    private pollingInterval: any = null;
    private countdownInterval: any = null;

    constructor(
        private orderService: OrderService,
        private router: Router,
        private modalService: ModalService
    ) {}

    ngOnInit() {
        if (this.paymentSession) {
            this.remainingSeconds = this.paymentSession.expiresInSeconds || 900;
        }
        // Kiểm tra ngay lần đầu
        this.checkStatus();
        // Poll mỗi 5 giây
        this.pollingInterval = setInterval(() => this.checkStatus(), 5000);
        // Đếm ngược
        this.countdownInterval = setInterval(() => {
            if (this.remainingSeconds > 0) this.remainingSeconds--;
        }, 1000);
    }

    ngOnDestroy() {
        this.stopAll();
    }

    private stopAll() {
        if (this.pollingInterval) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
        if (this.countdownInterval) { clearInterval(this.countdownInterval); this.countdownInterval = null; }
    }

    private checkStatus() {
        if (!this.paymentSession?.paymentRef || this.paymentStatus === 'PAID') return;

        this.orderService.checkPaymentStatus(this.paymentSession.paymentRef).subscribe({
            next: (session: PaymentSession) => {
                this.paymentStatus = session.status;
                if (session.status === 'PAID') {
                    this.stopAll();
                    this.handlePaymentSuccess();
                }
            },
            error: (err: any) => {
                console.error('Error checking payment status:', err);
            }
        });
    }

    handlePaymentSuccess() {
        this.modalService.alert({
            title: '✅ Thanh toán thành công!',
            message: 'Hệ thống đã xác nhận thanh toán. Đơn hàng của bạn đã được tạo và đang được xử lý!',
            variant: 'success'
        }).then(() => {
            this.paymentSuccess.emit();
            this.router.navigate(['/profile'], { queryParams: { tab: 'orders' } });
        });
    }

    getStatusText(): string {
        if (this.paymentStatus === 'PAID') return 'Đã xác nhận thanh toán!';
        return 'Đang chờ thanh toán... Vui lòng không đóng trang này.';
    }

    formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    copyToClipboard(text: string, label: string) {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            console.log(`${label} đã sao chép!`);
        });
    }

    onCancel() {
        this.stopAll();
        this.cancelled.emit();
    }
}
