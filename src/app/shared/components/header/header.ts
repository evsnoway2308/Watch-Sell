import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/model/category.model';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
    authService = inject(AuthService);
    userService = inject(UserService);
    categoryService = inject(CategoryService);
    router = inject(Router);

    get isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    user = signal<any>(null);
    categories = signal<Category[]>([]);

    get isAdmin(): boolean {
        const role = this.user()?.role;
        if (!role) return false;
        const upperRole = role.toUpperCase();
        return upperRole === 'ADMIN' || upperRole === 'ROLE_ADMIN';
    }

    constructor() {
        // Reactively upate user info when login state changes
        effect(() => {
            if (this.authService.isLoggedIn()) {
                this.fetchProfile();
            } else {
                this.user.set(null);
            }
        });
    }

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.fetchProfile();
        }
        this.fetchCategories();
    }

    private getFallbackName(): string {
        if (typeof window !== 'undefined' && window.localStorage) {
            let name = localStorage.getItem('user_name');
            if (name) return name;

            const token = localStorage.getItem('access_token');
            if (token && token.includes('.')) {
                try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1]));
                        return payload.fullName || payload.name || payload.sub || 'Người dùng';
                    }
                } catch (e) { }
            }
        }
        return 'Người dùng';
    }

    private setFallbackUser() {
        const name = this.getFallbackName();
        let avatar = null;
        if (typeof window !== 'undefined' && window.localStorage) {
            avatar = localStorage.getItem('user_avatar');
        }
        this.user.set({ name, avatar });
    }

    fetchProfile() {
        // Immediately set user from JWT or Storage to avoid "Đang tải"
        this.setFallbackUser();

        this.userService.getMyProfile().subscribe({
            next: (res) => {
                let userData = res;
                if (res && res.result) {
                    userData = res.result;
                } else if (res && res.data) {
                    userData = res.data;
                }

                if (!userData.name && !userData.fullName) {
                    userData.name = this.getFallbackName();
                }

                this.user.set(userData);
            },
            error: (err) => {
                console.error('Failed to fetch profile in Header:', err);
                // Keep the fallback user set by setFallbackUser() above
                // Do NOT call logout() here as it causes a redirect loop if the server is slow or has minor issues
            }
        });
    }

    fetchCategories() {
        this.categoryService.getCategories().subscribe({
            next: (res) => {
                if (Array.isArray(res)) {
                    this.categories.set(res);
                } else if (res && res.result && Array.isArray(res.result)) {
                    this.categories.set(res.result);
                } else if (res && res.data && Array.isArray(res.data)) {
                    this.categories.set(res.data);
                }
            },
            error: (err) => {
                console.error('Failed to fetch categories:', err);
            }
        });
    }

    logout() {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_avatar');
        }
        this.authService.logout();
    }

    getRoleDisplayName(role: string): string {
        if (!role) return 'Khách hàng';

        let roleName = role.toUpperCase();
        if (roleName.startsWith('ROLE_')) {
            roleName = roleName.substring(5);
        }

        const roles: { [key: string]: string } = {
            'ADMIN': 'Quản trị viên',
            'CUSTOMER': 'Khách hàng',
            'SHOP_OWNER': 'Chủ cửa hàng',
            'USER': 'Thành viên'
        };
        return roles[roleName] || role;
    }
}
