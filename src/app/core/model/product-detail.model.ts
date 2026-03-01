export interface ProductDetailResponse {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    categoryName: string;
    stock: number;
    available: boolean;
    averageRating: number;
    reviewCount: number;
    images: string[];
}
