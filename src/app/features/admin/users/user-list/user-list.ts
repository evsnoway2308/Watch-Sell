import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-admin-user-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-list.html',
    styleUrl: './user-list.css'
})
export class AdminUserListComponent implements OnInit {
    private userService = inject(UserService);
    private toastr = inject(ToastrService);

    users = signal<any[]>([]);
    totalElements = signal(0);
    totalPages = signal(0);
    currentPage = signal(0);
    pageSize = 10;

    keyword = '';
    selectedStatus = 'ALL';
    isShopOwner: boolean | null = null;
    isLoading = signal(false);

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.isLoading.set(true);
        this.userService.getAllUsers(
            this.currentPage(),
            this.pageSize,
            this.keyword,
            this.selectedStatus,
            this.isShopOwner ?? undefined
        ).subscribe({
            next: (res) => {
                this.users.set(res.content || []);
                this.totalElements.set(res.totalElements || 0);
                this.totalPages.set(res.totalPages || 0);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading users:', err);
                this.toastr.error('Không thể tải danh sách người dùng');
                this.isLoading.set(false);
            }
        });
    }

    onSearch() {
        this.currentPage.set(0);
        this.loadUsers();
    }

    onStatusChange() {
        this.currentPage.set(0);
        this.loadUsers();
    }

    onRoleChange(value: string) {
        this.currentPage.set(0);
        if (value === 'ALL') {
            this.isShopOwner = null;
        } else {
            this.isShopOwner = value === 'SHOP_OWNER';
        }
        this.loadUsers();
    }

    toggleStatus(user: any) {
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const actionText = newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa';

        if (confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) {
            this.userService.updateUserStatus(user.id, newStatus).subscribe({
                next: () => {
                    this.toastr.success(`Đã ${actionText} tài khoản thành công`);
                    this.loadUsers();
                },
                error: (err) => {
                    console.error('Error updating user status:', err);
                    this.toastr.error('Thao tác thất bại');
                }
            });
        }
    }

    goToPage(page: number) {
        if (page >= 0 && page < this.totalPages()) {
            this.currentPage.set(page);
            this.loadUsers();
        }
    }

    getRoleBadgeClass(role: string): string {
        if (!role) return 'badge-secondary';
        switch (role.toUpperCase()) {
            case 'ADMIN': return 'badge-danger';
            case 'SHOP_OWNER': return 'badge-primary';
            default: return 'badge-info';
        }
    }

    getRoleDisplayName(role: string): string {
        if (!role) return 'N/A';
        const r = role.toUpperCase();
        if (r.includes('ADMIN')) return 'Quản trị viên';
        if (r.includes('SHOP_OWNER')) return 'Chủ cửa hàng';
        return 'Người dùng';
    }
}
