import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminOrderService, Order } from '../../../core/services/admin-order.service';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-orders.component.html',
    styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
    orders: Order[] = [];
    loading = false;
    error = '';

    statusOptions = ['PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

    constructor(private adminOrderService: AdminOrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;
        this.adminOrderService.getAllOrders().subscribe({
            next: (data) => {
                this.orders = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Không thể tải danh sách đơn hàng.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    updateStatus(orderId: number, status: string): void {
        this.adminOrderService.updateOrderStatus(orderId, status).subscribe({
            next: (updatedOrder) => {
                const index = this.orders.findIndex(o => o.id === updatedOrder.id);
                if (index !== -1) {
                    this.orders[index].status = updatedOrder.status;
                }
                // Optional: Show success toast
            },
            error: (err) => {
                alert('Cập nhật trạng thái thất bại.');
                console.error(err);
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'SHIPPING': return 'status-shipping';
            case 'DELIVERED': return 'status-delivered';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    }
}
