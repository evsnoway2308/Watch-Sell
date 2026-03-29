import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { ModalService } from '../../../../core/services/modal.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductResponse } from '../../../../core/model/product.model';
import { Page } from '../../../../core/model/pagination.model';
import { Category } from '../../../../core/model/category.model';

@Component({
    selector: 'app-admin-product-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
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

    searchKeyword: string = '';
    selectedCategory: string = '';
    categories: Category[] = [];
    private searchSubject = new Subject<string>();

    constructor(
        private productService: ProductService,
        private categoryService: CategoryService,
        private modalService: ModalService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe((keyword: string) => {
            this.searchKeyword = keyword;
            this.currentPage = 0;
            this.updateQueryParams();
        });
    }

    ngOnInit(): void {
        this.loadCategories();
        this.querySub = this.route.queryParams.subscribe(params => {
            this.currentPage = params['page'] ? +params['page'] : 0;
            this.pageSize = params['size'] ? +params['size'] : 10;
            this.searchKeyword = params['keyword'] || '';
            
            // Map categoryId from query to selectedCategory properly
            const paramCatId = params['categoryId'];
            this.selectedCategory = paramCatId != null && paramCatId !== '' ? paramCatId : '';
            
            this.loadProducts();
        });
    }

    ngOnDestroy(): void {
        this.querySub?.unsubscribe();
        this.searchSubject.complete();
    }

    loadCategories(): void {
        this.categoryService.getCategories().subscribe({
            next: (res: any) => {
                 if (Array.isArray(res)) {
                     this.categories = res;
                 } else if (res && res.result && Array.isArray(res.result)) {
                     this.categories = res.result;
                 } else if (res && res.data && Array.isArray(res.data)) {
                     this.categories = res.data;
                 }
            },
            error: (err) => console.error("Error loading categories", err)
        });
    }

    onSearchChange(keyword: string): void {
        this.searchSubject.next(keyword);
    }

    onCategoryChange(categoryId: string): void {
        this.selectedCategory = categoryId;
        this.currentPage = 0;
        this.updateQueryParams();
    }

    updateQueryParams(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { 
                page: this.currentPage > 0 ? this.currentPage : null, 
                keyword: this.searchKeyword ? this.searchKeyword : null, 
                categoryId: this.selectedCategory ? this.selectedCategory : null 
            },
            queryParamsHandling: 'merge'
        });
    }

    loadProducts(): void {
        this.isLoading = true;
        
        let catId = this.selectedCategory ? Number(this.selectedCategory) : undefined;
        let kw = this.searchKeyword ? this.searchKeyword.trim() : undefined;

        console.log('Fetching products - Page:', this.currentPage, 'Size:', this.pageSize, 'Category:', catId, 'Keyword:', kw);
        this.productService.getProducts(this.currentPage, this.pageSize, catId, kw).subscribe({
            next: (page: Page<ProductResponse>) => {
                this.products = page.content;
                this.totalPages = page.totalPages;
                this.totalElements = page.totalElements;
                this.isLoading = false;
                console.log('Products loaded:', this.products.length);
            },
            error: (err) => {
                console.error('Error fetching products for admin:', err);
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number): void {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.updateQueryParams();
        }
    }

    getPages(): number[] {
        const pages = [];
        for (let i = 0; i < this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    async deleteProduct(id: number): Promise<void> {
        console.log('Delete button clicked for product ID:', id);

        const confirmed = await this.modalService.confirm({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa sản phẩm này không? Thao tác này không thể hoàn tác.',
            confirmText: 'Xóa ngay',
            cancelText: 'Hủy'
        });

        if (confirmed) {
            this.isLoading = true;
            console.log('Confirm deletion for ID:', id);
            this.productService.deleteProduct(id).subscribe({
                next: () => {
                    console.log('Delete successful for ID:', id);
                    this.modalService.alert({
                        title: 'Thành công',
                        message: 'Sản phẩm đã được xóa khỏi hệ thống.'
                    });
                    this.loadProducts();
                },
                error: (err) => {
                    console.error('Error deleting product:', err);
                    this.modalService.alert({
                        title: 'Lỗi',
                        message: 'Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại sau.'
                    });
                    this.isLoading = false;
                }
            });
        }
    }

    editProduct(id: number): void {
        this.router.navigate(['/admin/products/edit', id]);
    }
}
