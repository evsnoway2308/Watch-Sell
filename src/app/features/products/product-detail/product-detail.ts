import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductDetailResponse } from '../../../core/model/product-detail.model';
import { ModalService } from '../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { ReviewResponse, ReviewRequest } from '../../../core/model/review.model';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
    product?: ProductDetailResponse;
    selectedImage?: string;
    isLoading = true;
    selectedQuantity = 1;

    reviews: ReviewResponse[] = [];
    newReview: ReviewRequest = { rating: 5, comment: '' };
    hoveredRating: number = 0;
    isReviewSubmitting = false;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService,
        private modalService: ModalService,
        private toastr: ToastrService,
        private router: Router,
        public authService: AuthService,
        private reviewService: ReviewService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadProduct(+id);
            this.loadReviews(+id);
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

    increaseQuantity(): void {
        if (this.product && this.selectedQuantity < this.product.stock) {
            this.selectedQuantity++;
        }
    }

    decreaseQuantity(): void {
        if (this.selectedQuantity > 1) {
            this.selectedQuantity--;
        }
    }

    onQuantityChange(event: any): void {
        const val = parseInt(event.target.value);
        if (isNaN(val) || val < 1) {
            this.selectedQuantity = 1;
        } else if (this.product && val > this.product.stock) {
            this.selectedQuantity = this.product.stock;
        } else {
            this.selectedQuantity = val;
        }
    }

    addToCart(): void {
        if (!this.product) return;

        if (!this.authService.isLoggedIn()) {
            this.toastr.warning('Vui lòng đăng nhập để tiếp tục mua hàng.', 'Thông báo');
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }

        this.cartService.addToCart(this.product.id, this.selectedQuantity).subscribe({
            next: () => {
                this.toastr.success('Đã thêm sản phẩm vào giỏ hàng!', 'Thành công', {
                    timeOut: 3000,
                    progressBar: true,
                    positionClass: 'toast-top-right'
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

        if (!this.authService.isLoggedIn()) {
            this.toastr.warning('Vui lòng đăng nhập để tiếp tục mua hàng.', 'Thông báo');
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }

        this.router.navigate(['/checkout'], {
            state: {
                product: {
                    ...this.product,
                    selectedQuantity: this.selectedQuantity
                }
            }
        });
    }

    loadReviews(productId: number): void {
        this.reviewService.getReviewsByProduct(productId).subscribe({
            next: (data) => {
                this.reviews = data;
            },
            error: (err) => {
                console.error('Error loading reviews:', err);
            }
        });
    }

    setRating(star: number): void {
        this.newReview.rating = star;
    }

    setHoveredRating(star: number): void {
        this.hoveredRating = star;
    }

    submitReview(): void {
        if (!this.product) return;

        if (!this.authService.isLoggedIn()) {
            this.toastr.warning('Vui lòng đăng nhập để đánh giá sản phẩm.', 'Thông báo');
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }

        if (!this.newReview.comment || this.newReview.comment.trim() === '') {
            this.toastr.warning('Vui lòng nhập nội dung đánh giá.', 'Thông báo');
            return;
        }

        this.isReviewSubmitting = true;
        this.reviewService.addReview(this.product.id, this.newReview).subscribe({
            next: (review) => {
                this.toastr.success('Phản hồi của bạn đã được gửi.', 'Thành công');
                this.newReview = { rating: 5, comment: '' };
                this.hoveredRating = 0;
                this.isReviewSubmitting = false;
                this.loadReviews(this.product!.id);
            },
            error: (err) => {
                console.error('Error submitting review:', err);
                const msg = err.error?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
                this.toastr.error(msg, 'Lỗi');
                this.isReviewSubmitting = false;
            }
        });
    }
}
