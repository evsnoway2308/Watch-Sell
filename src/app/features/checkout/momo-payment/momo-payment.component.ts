import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-momo-payment',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="momo-overlay">
        <div class="momo-modal">
            <div class="momo-header">
                <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo Logo" class="momo-logo">
                <h2>Thanh toán qua MoMo</h2>
            </div>
            
            <div class="momo-body">
                <div class="payment-info">
                    <div class="info-row">
                        <span>Đơn hàng:</span>
                        <span class="value">#{{orderId}}</span>
                    </div>
                    <div class="info-row">
                        <span>Số tiền:</span>
                        <span class="value salary">{{amount | currency:'VND':'symbol':'1.0-0'}}</span>
                    </div>
                </div>

                <div class="qr-section">
                    <div class="qr-container">
                        <img [src]="qrImage" alt="MoMo QR Code" class="qr-code">
                        <div class="qr-scan-line"></div>
                    </div>
                    <p class="qr-instruction">Sử dụng App <strong>MoMo</strong> để quét mã</p>
                </div>

                <div class="timer-section">
                    <p>Giao dịch hết hạn trong: <span class="timer">{{formatTime(timeLeft)}}</span></p>
                </div>
            </div>

            <div class="momo-footer">
                <button type="button" class="btn btn-cancel" (click)="onCancel()">Hủy bỏ</button>
                <button type="button" class="btn btn-confirm" (click)="onConfirm()">Xác nhận đã chuyển</button>
            </div>
        </div>
    </div>
    `,
    styles: [`
    .momo-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    }
    .momo-modal {
        background: #fff;
        width: 100%;
        max-width: 400px;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .momo-header {
        background: #ae2070;
        color: white;
        padding: 20px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    .momo-logo {
        height: 60px;
        filter: brightness(0) invert(1);
    }
    .momo-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }
    .momo-body {
        padding: 25px;
    }
    .payment-info {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 25px;
    }
    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.95rem;
        color: #64748b;
    }
    .info-row:last-child { margin-bottom: 0; }
    .info-row .value {
        font-weight: 700;
        color: #1e293b;
    }
    .info-row .value.salary {
        color: #ae2070;
        font-size: 1.1rem;
    }
    .qr-section {
        text-align: center;
        margin-bottom: 20px;
    }
    .qr-container {
        position: relative;
        width: 220px;
        height: 220px;
        margin: 0 auto 15px;
        padding: 10px;
        border: 1px solid #e2e8f0;
        border-radius: 15px;
        background: #fff;
    }
    .qr-code {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .qr-scan-line {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 2px;
        background: #ae2070;
        box-shadow: 0 0 10px #ae2070;
        animation: scan 2s linear infinite;
    }
    @keyframes scan {
        0% { top: 0; }
        100% { top: 100%; }
    }
    .qr-instruction {
        font-size: 0.9rem;
        color: #64748b;
    }
    .timer-section {
        text-align: center;
        font-size: 0.9rem;
        color: #94a3b8;
    }
    .timer {
        color: #dc2626;
        font-weight: 700;
    }
    .momo-footer {
        padding: 20px;
        display: flex;
        gap: 12px;
        border-top: 1px solid #f1f5f9;
        background: #fafafa;
    }
    .btn {
        flex: 1;
        padding: 12px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }
    .btn-cancel {
        background: #f1f5f9;
        color: #64748b;
    }
    .btn-cancel:hover { background: #e2e8f0; }
    .btn-confirm {
        background: #ae2070;
        color: white;
    }
    .btn-confirm:hover { background: #8e1a5b; box-shadow: 0 4px 12px rgba(174, 32, 112, 0.3); }
    `]
})
export class MomoPaymentComponent implements OnInit, OnDestroy {
    @Input() orderId: number = 0;
    @Input() amount: number = 0;
    @Input() qrImage: string = '';
    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    timeLeft: number = 900; // 15 minutes
    interval: any;

    ngOnInit() {
        this.startTimer();
    }

    ngOnDestroy() {
        if (this.interval) clearInterval(this.interval);
    }

    startTimer() {
        this.interval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                this.onCancel();
            }
        }, 1000);
    }

    formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    onConfirm() {
        this.confirmed.emit();
    }

    onCancel() {
        this.cancelled.emit();
    }
}
