import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReviewService } from '../../../core/services/review.service';
import { ModalService } from '../../../core/services/modal.service';
import { ReviewResponse } from '../../../core/model/review.model';
import { Page } from '../../../core/model/pagination.model';

@Component({
    selector: 'app-admin-review-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-review-list.html',
    styleUrl: './admin-review-list.css'
})
export class AdminReviewListComponent implements OnInit, OnDestroy {
    reviews: ReviewResponse[] = [];
    currentPage: number = 0;
    pageSize: number = 10;
    totalPages: number = 0;
    totalElements: number = 0;
    isLoading: boolean = false;
    private querySub?: Subscription;

    constructor(
        private reviewService: ReviewService,
        private modalService: ModalService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.querySub = this.route.queryParams.subscribe(params => {
            this.currentPage = params['page'] ? +params['page'] : 0;
            this.pageSize = params['size'] ? +params['size'] : 10;
            this.loadReviews();
        });
    }

    ngOnDestroy(): void {
        this.querySub?.unsubscribe();
    }

    loadReviews(): void {
        this.isLoading = true;
        this.reviewService.getAllReviewsAdmin(this.currentPage, this.pageSize).subscribe({
            next: (page: Page<ReviewResponse>) => {
                this.reviews = page.content;
                this.totalPages = page.totalPages;
                this.totalElements = page.totalElements;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Lỗi tải danh sách đánh giá', err);
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number): void {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { page: this.currentPage > 0 ? this.currentPage : null },
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

    async deleteReview(id: number): Promise<void> {
        const confirmed = await this.modalService.confirm({
            title: 'Xóa đánh giá',
            message: 'Bạn có chắc chắn muốn xóa đánh giá này không? Khách hàng có thể sẽ không thích điều này!',
            confirmText: 'Xóa',
            cancelText: 'Hủy'
        });

        if (confirmed) {
            this.isLoading = true;
            this.reviewService.deleteReviewAdmin(id).subscribe({
                next: () => {
                    this.modalService.alert({
                        title: 'Thành công',
                        message: 'Đã xóa đánh giá thành công khỏi hệ thống.'
                    });
                    this.loadReviews();
                },
                error: (err: any) => {
                    console.error('Lỗi khi xóa đánh giá:', err);
                    this.modalService.alert({
                        title: 'Lỗi',
                        message: 'Có lỗi xảy ra khi xóa đánh giá.'
                    });
                    this.isLoading = false;
                }
            });
        }
    }

    getStarArray(rating: number): number[] {
        return Array(5).fill(0).map((x, i) => i);
    }
}
