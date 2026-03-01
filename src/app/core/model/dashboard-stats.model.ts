import { ProductResponse } from './product.model';

export interface OrderResponse {
    id: number;
    orderDate: string;
    totalAmount: number;
    status: string;
    customerName: string;
}

export interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    recentProducts: ProductResponse[];
    recentOrders: OrderResponse[];
}
