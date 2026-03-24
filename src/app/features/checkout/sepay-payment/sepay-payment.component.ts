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
            </div>
            
            <div class="sepay-body">
                <div class="qr-section">
                    <div class="qr-container">
                        <img *ngIf="order?.qrCodeUrl" [src]="order?.qrCodeUrl" alt="Mã thanh toán QR" class="qr-code">
                        <div class="qr-placeholder" *ngIf="!order?.qrCodeUrl">
                            <div class="spinner"></div>
                            <p>Đang tải mã QR...</p>
                        </div>
                    </div>
                    
                    <div class="status-indicator">
                        <div class="spinner" *ngIf="orderStatus !== 'PAID'"></div>
                        <span class="status-text">{{ getStatusText() }}</span>
                    </div>
                </div>

                <div class="payment-details">
                    <div class="detail-card">
                        <div class="detail-item">
                            <label>Mã Đơn Hàng</label>
                            <div class="value-row">
                                <span class="value order-id">#{{ order?.id }}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label>Số Tiền Cần Thanh Toán</label>
                            <div class="value-row">
                                <span class="value amount">{{ order?.totalAmount | currency:'VND':'symbol':'1.0-0' }}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label>Ngân hàng nhận</label>
                            <div class="value-row">
                                <span class="value">BIDV</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label>Số tài khoản</label>
                            <div class="value-row">
                                <span class="value highlight">450630423</span>
                                <button class="btn-copy" (click)="copyToClipboard('450630423', 'Số tài khoản')">
                                    <i></i> Sao chép
                                </button>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label>Chủ tài khoản</label>
                            <div class="value-row">
                                <span class="value">NGUYEN DUC KHANH</span>
                            </div>
                        </div>
                        <div class="detail-item content-transfer">
                            <label>Nội dung chuyển khoản</label>
                            <div class="value-row">
                                <span class="value text-red">{{ order?.paymentRef || 'N/A' }}</span>
                                <button class="btn-copy highlight-btn" (click)="copyToClipboard(order?.paymentRef || '', 'Nội dung')">
                                    <i></i> Sao chép
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="warning-box">
                    <p><strong>Lưu ý:</strong> Bắt buộc nhập chính xác <strong>nội dung chuyển khoản</strong> để hệ thống tự động duyệt đơn.</p>
                </div>
            </div>

            <div class="sepay-footer">
                <button type="button" class="btn-cancel" (click)="onCancel()">Đóng</button>
            </div>
        </div>
    </div>
    `,
    styles: [`
    .sepay-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(10, 25, 47, 0.85);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
        backdrop-filter: blur(8px);
    }
    .sepay-modal {
        background: #ffffff;
        width: 95%;
        max-width: 460px;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        color: #1e293b;
        font-family: 'Inter', sans-serif;
    }
    @keyframes slideUp {
        from { transform: translateY(40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .sepay-header {
        background: hsl(210, 80%, 35%); /* Deep blue, feeling safe & secure */
        color: white;
        padding: 24px 20px;
        text-align: center;
    }
    .sepay-header h2 {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 700;
        letter-spacing: -0.01em;
    }
    .sepay-body {
        padding: 24px;
    }
    .qr-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 24px;
        background: hsl(204, 100%, 97%); /* Light soft blue bg */
        border-radius: 16px;
        padding: 24px 16px;
        border: 1px dashed hsl(204, 80%, 85%);
    }
    .qr-container {
        position: relative;
        width: 240px;
        height: 240px;
        background: white;
        padding: 10px;
        border-radius: 16px;
        border: 1px solid hsl(210, 40%, 90%);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .qr-code {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .qr-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: hsl(210, 40%, 60%);
    }
    .status-indicator {
        display: flex;
        align-items: center;
        gap: 12px;
        background: hsl(150, 40%, 95%); /* light soothing green */
        padding: 10px 20px;
        border-radius: 30px;
        border: 1px solid hsl(150, 40%, 85%);
    }
    .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid hsl(150, 40%, 80%);
        border-top-color: hsl(150, 60%, 40%);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .status-text {
        font-size: 0.9rem;
        font-weight: 600;
        color: hsl(150, 60%, 35%);
    }
    .payment-details {
        margin-bottom: 24px;
    }
    .detail-card {
        background: white;
        border: 1px solid hsl(210, 40%, 92%);
        border-radius: 12px;
        padding: 4px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .detail-item {
        padding: 14px 0;
        border-bottom: 1px solid hsl(210, 40%, 94%);
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-item.content-transfer {
        background: hsl(50, 100%, 97%); /* Slight yellow highlight */
        margin: 0 -16px;
        padding: 14px 16px;
        border-radius: 0 0 12px 12px;
        border-top: 1px dashed hsl(50, 50%, 75%);
    }
    .detail-item label {
        display: block;
        font-size: 0.8rem;
        font-weight: 500;
        color: hsl(210, 20%, 50%);
        margin-bottom: 6px;
    }
    .value-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .value {
        font-weight: 600;
        font-size: 1.05rem;
        color: hsl(210, 30%, 20%);
    }
    .value.order-id {
        color: hsl(210, 10%, 40%);
        font-family: 'Space Mono', monospace;
    }
    .value.highlight {
        color: hsl(210, 80%, 45%);
        font-family: 'Space Mono', 'Consolas', monospace;
    }
    .value.text-red {
        color: hsl(350, 80%, 45%); /* Highlight red for paymentRef */
        font-weight: 800;
        font-size: 1.15rem;
        background: hsl(350, 100%, 97%);
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid hsl(350, 100%, 90%);
        font-family: 'Space Mono', 'Consolas', monospace;
    }
    .value.amount {
        color: hsl(210, 80%, 35%); /* Deep blue for amount */
        font-size: 1.4rem;
        font-weight: 800;
        letter-spacing: -0.02em;
    }
    .btn-copy {
        background: hsl(210, 40%, 95%);
        color: hsl(210, 80%, 45%);
        border: 1px solid hsl(210, 40%, 90%);
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-copy:hover { 
        background: hsl(210, 80%, 45%); 
        color: white; 
        border-color: hsl(210, 80%, 45%);
    }
    .btn-copy.highlight-btn {
        background: hsl(350, 80%, 45%);
        color: white;
        border-color: hsl(350, 80%, 45%);
    }
    .btn-copy.highlight-btn:hover {
        background: hsl(350, 80%, 35%);
    }
    .btn-copy:active { transform: scale(0.96); }
    .warning-box {
        background: hsl(0, 80%, 97%);
        border: 1px solid hsl(0, 60%, 85%);
        padding: 14px;
        border-radius: 12px;
        font-size: 0.85rem;
        color: hsl(0, 60%, 40%);
        line-height: 1.5;
        text-align: center;
    }
    .sepay-footer {
        padding: 20px;
        border-top: 1px solid hsl(210, 40%, 92%);
        background: hsl(210, 40%, 98%);
        text-align: center;
    }
    .btn-cancel {
        background: transparent;
        color: hsl(210, 30%, 40%);
        border: 1px solid hsl(210, 30%, 80%);
        padding: 12px 32px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-cancel:hover { 
        background: white; 
        color: hsl(210, 30%, 20%); 
        border-color: hsl(210, 30%, 60%); 
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
        this.pollingInterval = setInterval(() => {
            if (this.order && this.order.id) {
                this.checkOrderStatus();
            }
        }, 5000); // Mức khoảng 5 giây mỗi lần
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    }

    checkOrderStatus() {
        if (!this.order) return;
        this.orderService.getOrderById(this.order.id).subscribe({
            next: (order) => {
                this.orderStatus = order.status;
                if (order.status === 'PAID') {
                    this.handlePaymentSuccess();
                }
            },
            error: (err) => {
                console.error('Error polling order status:', err);
            }
        });
    }

    handlePaymentSuccess() {
        this.stopPolling();
        this.modalService.alert({
            title: 'Thanh toán thành công!',
            message: 'Hệ thống đã nhận được thanh toán. Xin chúc mừng. Đơn hàng của bạn đang được xử lý!',
            variant: 'success'
        }).then(() => {
            this.router.navigate(['/']);
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
