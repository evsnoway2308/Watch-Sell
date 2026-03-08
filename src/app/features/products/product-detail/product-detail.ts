import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductDetailResponse } from '../../../core/model/product-detail.model';
import { ModalService } from '../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
        private productService: ProductService,
        private cartService: CartService,
        private modalService: ModalService,
        private toastr: ToastrService,
        private router: Router
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
        if (!this.product) return;
        this.cartService.addToCart(this.product.id).subscribe({
            next: () => {
                this.toastr.success('Đã thêm sản phẩm vào giỏ hàng!', 'Thành công', {
                    timeOut: 3000,
                    progressBar: true,
                    positionClass: 'toast-bottom-right'
                });
            },
            error: (err) => {
                console.error('Error adding to cart:', err);
                this.toastr.error('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.');
            }
        });
    }

    buyNow(): void {
        if (!this.product) return;
        this.cartService.addToCart(this.product.id).subscribe({
            next: () => {
                this.router.navigate(['/checkout']);
            },
            error: (err) => {
                console.error('Error in Buy Now:', err);
                this.toastr.error('Có lỗi xảy ra khi xử lý mua hàng.');
            }
        });
    }
}
