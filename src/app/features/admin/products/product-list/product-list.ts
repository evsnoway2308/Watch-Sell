import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { ProductResponse } from '../../../../core/model/product.model';
import { Page } from '../../../../core/model/pagination.model';

@Component({
    selector: 'app-admin-product-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-list.html',
    styleUrl: './product-list.css'
})
export class AdminProductListComponent implements OnInit, OnDestroy {
    products: ProductResponse[] = [];
    currentPage: number = 0;
    pageSize: number = 10;
    totalPages: number = 0;
    totalElements: number = 0;
    isLoading: boolean = false;
    private querySub?: Subscription;

    constructor(
        private productService: ProductService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.querySub = this.route.queryParams.subscribe(params => {
            this.currentPage = params['page'] ? +params['page'] : 0;
            this.pageSize = params['size'] ? +params['size'] : 10;
            this.loadProducts();
        });
    }

    ngOnDestroy(): void {
        this.querySub?.unsubscribe();
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
                console.error('Error fetching products for admin:', err);
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number): void {
        if (page >= 0 && page < this.totalPages) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { page: page },
                queryParamsHandling: 'merge'
            });
        }
    }

    getPages(): number[] {
        const pages = [];
        for (let i = 0; i < this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    deleteProduct(id: number): void {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            console.log('Delete product:', id);
            // TODO: Implement delete in ProductService
        }
    }

    editProduct(id: number): void {
        this.router.navigate(['/admin/products/edit', id]);
    }
}
