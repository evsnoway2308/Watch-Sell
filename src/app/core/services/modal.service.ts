import { Injectable, signal, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export interface ModalConfig {

    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'confirm' | 'alert';
    variant?: 'primary' | 'danger' | 'warning' | 'success';
    icon?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private isOpenSignal = signal<boolean>(false);
    private configSignal = signal<ModalConfig | null>(null);
    private toastr = inject(ToastrService);
    private resolveCallback: ((value: boolean) => void) | null = null;

    isOpen = this.isOpenSignal.asReadonly();
    config = this.configSignal.asReadonly();

    confirm(config: ModalConfig): Promise<boolean> {
        this.configSignal.set({
            ...config,
            confirmText: config.confirmText || 'Xác nhận',
            cancelText: config.cancelText || 'Hủy',
            type: 'confirm',
            variant: config.variant || 'primary'
        });
        this.isOpenSignal.set(true);

        return new Promise((resolve) => {
            this.resolveCallback = resolve;
        });
    }

    alert(config: ModalConfig): Promise<void> {
        const variant = config.variant || 'primary';
        if (variant === 'danger') {
            this.toastr.error(config.message, config.title);
        } else if (variant === 'warning') {
            this.toastr.warning(config.message, config.title);
        } else if (variant === 'success') {
            this.toastr.success(config.message, config.title);
        } else {
            this.toastr.info(config.message, config.title);
        }
        return Promise.resolve();
    }


    close(result: boolean): void {
        this.isOpenSignal.set(false);
        if (this.resolveCallback) {
            this.resolveCallback(result);
            this.resolveCallback = null;
        }
    }
}
