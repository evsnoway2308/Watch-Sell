import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './modal.html',
    styleUrl: './modal.css'
})
export class ModalComponent {
    modalService = inject(ModalService);

    onConfirm() {
        this.modalService.close(true);
    }

    onCancel() {
        this.modalService.close(false);
    }

    getDefaultIcon(): string {
        const variant = this.modalService.config()?.variant;
        switch (variant) {
            case 'danger': return 'fas fa-exclamation-triangle';
            case 'warning': return 'fas fa-alert';
            case 'success': return 'fas fa-check-circle';
            default: return 'fas fa-info-circle';
        }
    }
}
