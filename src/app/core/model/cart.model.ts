export interface CartItemResponse {
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    productImageUrl: string;
    quantity: number;
    subTotal: number;
}

export interface CartResponse {
    id: number;
    items: CartItemResponse[];
    totalAmount: number;
}
