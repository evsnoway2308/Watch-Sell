import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductDetailResponse } from '../../../core/model/product-detail.model';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
    product?: ProductDetailResponse;
    selectedImage?: string;
    isLoading = true;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadProduct(+id);
        }
    }

    loadProduct(id: number): void {
        this.isLoading = true;
        this.productService.getProductById(id).subscribe({
            next: (data) => {
                this.product = data;
                this.selectedImage = data.imageUrl;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading product details:', err);
                this.isLoading = false;
            }
        });
    }

    selectImage(url: string): void {
        this.selectedImage = url;
    }

    get allImages(): string[] {
        if (!this.product) return [];
        return [this.product.imageUrl, ...(this.product.images || [])];
    }

    addToCart(): void {
        console.log('Added to cart:', this.product?.name);
        // TODO: Implement cart service
    }

    buyNow(): void {
        console.log('Buy now:', this.product?.name);
        // TODO: Implement checkout flow
    }
}
