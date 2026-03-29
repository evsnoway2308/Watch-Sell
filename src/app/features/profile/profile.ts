import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
    private fb = inject(FormBuilder);
    private userService = inject(UserService);
    private toastr = inject(ToastrService);

    profileForm: FormGroup;
    passwordForm: FormGroup;
    user: any;
    isLoading = true;
    isSubmitting = false;
    isChangingPassword = false;

    constructor() {
        this.profileForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phonenumber: [''],
            address: [''],
            avatarUrl: ['']
        });

        this.passwordForm = this.fb.group({
            oldPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.userService.getMyProfile().subscribe({
            next: (res) => {
                this.user = res;
                this.profileForm.patchValue({
                    name: res.name,
                    email: res.email,
                    phonenumber: res.phonenumber,
                    address: res.address,
                    avatarUrl: res.avatarUrl
                });
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading profile:', err);
                this.toastr.error('Không thể tải thông tin hồ sơ');
                this.isLoading = false;
            }
        });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onUpdateProfile(showToast: boolean = true): void {
        if (this.profileForm.invalid) return;

        this.isSubmitting = true;
        this.userService.updateProfile(this.profileForm.value).subscribe({
            next: () => {
                if (showToast) {
                    this.toastr.success('Cập nhật hồ sơ thành công');
                }
                this.isSubmitting = false;
                this.loadProfile();
            },
            error: (err) => {
                console.error('Error updating profile:', err);
                if (showToast) {
                    this.toastr.error('Lỗi khi cập nhật hồ sơ');
                }
                this.isSubmitting = false;
            }
        });
    }

    onChangePassword(): void {
        if (this.passwordForm.invalid) return;

        this.isChangingPassword = true;
        const { oldPassword, newPassword } = this.passwordForm.value;
        this.userService.changePassword({ oldPassword, newPassword }).subscribe({
            next: () => {
                this.toastr.success('Đổi mật khẩu thành công');
                this.passwordForm.reset();
                this.isChangingPassword = false;
            },
            error: (err) => {
                console.error('Error changing password:', err);
                this.toastr.error(err.error || 'Lỗi khi đổi mật khẩu');
                this.isChangingPassword = false;
            }
        });
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            this.userService.uploadAvatar(file).subscribe({
                next: (res) => {
                    this.profileForm.patchValue({ avatarUrl: res.url });
                    this.toastr.success('Tải ảnh lên thành công');
                    // Optionally save immediately
                    this.onUpdateProfile(false);
                },
                error: (err) => {
                    console.error('Error uploading avatar:', err);
                    this.toastr.error('Lỗi khi tải ảnh lên');
                }
            });
        }
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
