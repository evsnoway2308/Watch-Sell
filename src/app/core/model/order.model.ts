export interface OrderRequest {
    shippingAddress: string;
    phoneNumber: string;
    notes: string;
    paymentMethod: string;
    items?: { productId: number; quantity: number }[];
}

export interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        imageUrl: string;
        price: number;
    };
    quantity: number;
    price: number;
}


export interface Order {
    id: number;
    orderDate: string;
    totalAmount: number;
    status: string;
    shippingAddress: string;
    phoneNumber?: string;
    notes?: string;
    paymentMethod?: string;
    orderItems: OrderItem[];
    paymentRef?: string;
    qrCodeUrl?: string;
}
