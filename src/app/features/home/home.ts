import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductResponse } from '../../core/model/product.model';
import { Page } from '../../core/model/pagination.model';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
    products: ProductResponse[] = [];
    currentPage: number = 0;
    pageSize: number = 8;
    totalPages: number = 0;
    totalElements: number = 0;
    isLoading: boolean = false;

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private toastr: ToastrService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.isLoading = true;
        this.productService.getProducts(this.currentPage, this.pageSize).subscribe({
            next: (page: Page<ProductResponse>) => {
                this.products = page.content;
                this.totalPages = page.totalPages;
                this.totalElements = page.totalElements;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching products:', err);
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number): void {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    getPages(): number[] {
        const pages = [];
        for (let i = 0; i < this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    navigateToProduct(id: number): void {
        this.router.navigate(['/products', id]);
    }

    addToCart(event: Event, product: ProductResponse): void {
        event.preventDefault();
        event.stopPropagation();

        this.cartService.addToCart(product.id).subscribe({
            next: () => {
                this.toastr.success(`Đã thêm ${product.name} vào giỏ hàng!`, 'Thành công', {
                    timeOut: 2000,
                    progressBar: true,
                    positionClass: 'toast-top-right'
                });
            },
            error: (err: any) => {
                console.error('Error adding to cart:', err);
                this.toastr.error('Có lỗi xảy ra khi thêm vào giỏ hàng.');
            }
        });
    }
}

