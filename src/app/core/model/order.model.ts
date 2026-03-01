export interface OrderRequest {
    shippingAddress: string;
    phoneNumber: string;
    notes: string;
    paymentMethod: string;
}

export interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    orderDate: string;
    totalAmount: number;
    status: string;
    shippingAddress: string;
    orderItems: OrderItem[];
}
