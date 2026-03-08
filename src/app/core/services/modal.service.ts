import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'confirm' | 'alert';
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private isOpenSignal = signal<boolean>(false);
    private configSignal = signal<ModalConfig | null>(null);
    private resolveCallback: ((value: boolean) => void) | null = null;

    isOpen = this.isOpenSignal.asReadonly();
    config = this.configSignal.asReadonly();

    confirm(config: ModalConfig): Promise<boolean> {
        this.configSignal.set({
            ...config,
            confirmText: config.confirmText || 'Xác nhận',
            cancelText: config.cancelText || 'Hủy',
            type: 'confirm'
        });
        this.isOpenSignal.set(true);

        return new Promise((resolve) => {
            this.resolveCallback = resolve;
        });
    }

    alert(config: ModalConfig): Promise<void> {
        this.configSignal.set({
            ...config,
            confirmText: config.confirmText || 'Đóng',
            type: 'alert'
        });
        this.isOpenSignal.set(true);

        return new Promise((resolve) => {
            this.resolveCallback = (val) => resolve();
        });
    }

    close(result: boolean): void {
        this.isOpenSignal.set(false);
        if (this.resolveCallback) {
            this.resolveCallback(result);
            this.resolveCallback = null;
        }
    }
}
