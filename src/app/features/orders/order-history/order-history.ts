import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/model/order.model';

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './order-history.html',
    styleUrls: ['./order-history.css']
})
export class OrderHistoryComponent implements OnInit {
    private orderService = inject(OrderService);

    orders: Order[] = [];
    isLoading = true;

    ngOnInit(): void {
        this.loadOrders();
    }



    loadOrders(): void {
        this.isLoading = true;
        this.orderService.getMyOrders().subscribe({
            next: (res) => {
                this.orders = res;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching orders:', err);
                this.isLoading = false;
            }
        });
    }

    getStatusBadgeClass(status: string): string {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'status-pending';
            case 'PAID': return 'status-paid';
            case 'DELIVERED': return 'status-delivered';
            case 'CANCELLED': return 'status-cancelled';
            case 'SHIPPING': return 'status-shipping';
            default: return 'status-default';
        }
    }

    getStatusDisplayName(status: string): string {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'Đang xử lý';
            case 'PAID': return 'Đã thanh toán';
            case 'DELIVERED': return 'Đã giao hàng';
            case 'CANCELLED': return 'Đã hủy';
            case 'SHIPPING': return 'Đang giao hàng';
            default: return status || 'Không xác định';
        }
    }
}
