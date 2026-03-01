export interface ProductRequest {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    categoryId: number;
    stock: number;
    images: string[];
}
