export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    categoryName: string;
    averageRating: number;
    reviewCount: number;
    available: boolean;
    stock: number;
}
