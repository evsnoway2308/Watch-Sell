import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-google-callback',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './google-callback.component.html',
    styleUrl: './google-callback.component.css'
})
export class GoogleCallbackComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private toastr = inject(ToastrService);

    errorMessage = '';
    private timeoutId?: number;

    ngOnInit() {
        // Set timeout for 10 seconds
        this.timeoutId = window.setTimeout(() => {
            this.handleError('Xác thực Google đã hết thời gian chờ. Vui lòng thử lại.');
        }, 10000);

        // Get code or error from URL params
        this.route.queryParams.subscribe(params => {
            const code = params['code'];
            const error = params['error'];

            if (error) {
                this.handleError('Bạn đã từ chối cấp quyền. Vui lòng thử lại.');
                return;
            }

            if (!code) {
                this.handleError('Không nhận được mã xác thực từ Google.');
                return;
            }

            // Exchange code for tokens
            this.authService.loginWithGoogle(code).subscribe({
                next: () => {
                    this.clearTimeout();

                    // Get user profile and redirect
                    this.userService.getMyProfile().subscribe({
                        next: (user) => {
                            this.toastr.success(`Chào mừng, ${user.fullName}!`);

                            if (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') {
                                this.router.navigate(['/admin/dashboard']);
                            } else {
                                this.router.navigate(['/']);
                            }
                        },
                        error: () => {
                            // Even if profile fetch fails, redirect to home
                            this.router.navigate(['/']);
                        }
                    });
                },
                error: (err) => {
                    this.handleError('Đăng nhập Google thất bại. Vui lòng thử lại.');
                    console.error('Google login error:', err);
                }
            });
        });
    }

    private handleError(message: string) {
        this.clearTimeout();
        this.errorMessage = message;
        this.toastr.error(message);
    }

    private clearTimeout() {
        if (this.timeoutId) {
            window.clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
    }

    retryLogin() {
        this.router.navigate(['/login']);
    }

    ngOnDestroy() {
        this.clearTimeout();
    }
}
