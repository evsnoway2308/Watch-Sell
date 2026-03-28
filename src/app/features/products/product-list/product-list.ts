import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { ProductResponse } from '../../../core/model/product.model';
import { Page } from '../../../core/model/pagination.model';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-list.html',
    styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
    private productService = inject(ProductService);
    private categoryService = inject(CategoryService);
    private cartService = inject(CartService);
    private toastr = inject(ToastrService);
    private route = inject(ActivatedRoute);

    products: ProductResponse[] = [];
    currentPage: number = 0;
    pageSize: number = 12;
    totalPages: number = 0;
    totalElements: number = 0;
    isLoading: boolean = false;
    categoryId?: number;
    searchKeyword?: string;
    categoryName: string = 'Sản phẩm';

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.categoryId = params['category'] !== undefined ? +params['category'] : undefined;
            this.searchKeyword = params['search'] || undefined;
            this.currentPage = 0; // Reset to first page when category or search changes
            this.loadProducts();
            
            if (this.searchKeyword) {
                this.categoryName = `Kết quả tìm kiếm cho: "${this.searchKeyword}"`;
            } else if (this.categoryId !== undefined && this.categoryId !== null) {
                this.loadCategoryName();
            } else {
                this.categoryName = 'Tất cả sản phẩm';
            }
        });
    }

    loadProducts(): void {
        this.isLoading = true;
        this.productService.getProducts(this.currentPage, this.pageSize, this.categoryId, this.searchKeyword).subscribe({
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

    loadCategoryName(): void {
        this.categoryService.getCategoryById(this.categoryId!).subscribe({
            next: (cat) => {
                this.categoryName = cat.name;
            },
            error: (err) => {
                console.error('Error fetching category name:', err);
                // Fallback to a generic name
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
            error: (err) => {
                console.error('Error adding to cart:', err);
                this.toastr.error('Có lỗi xảy ra khi thêm vào giỏ hàng.');
            }
        });
    }

    getPages(): number[] {
        const pages = [];
        for (let i = 0; i < this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }
}
