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
    paymentRef?: string;
    qrCodeUrl?: string;
    orderItems: OrderItem[];
}

/**
 * Dùng cho initiateQrPayment / checkPaymentStatus (nếu cần trong tương lai).
 * Hiện tại flow dùng SepayPaymentComponent + getOrderById.
 */
export interface PaymentSession {
    paymentRef: string;
    qrCodeUrl: string;
    amount: number;
    status: string;
    expiresInSeconds: number;
}
