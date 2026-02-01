import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  showPassword = false;
  showConfirmPassword = false;


  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    name: ['', Validators.required],
    phonenumber: ['', Validators.required]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const val = this.registerForm.value;

      if (val.password !== val.confirmPassword) {
        this.toastr.error('Mật khẩu xác nhận không khớp!');
        return;
      }

      this.authService.signup(val).subscribe({
        next: (res) => {
          this.toastr.success('Đăng ký thành công! Hãy đăng nhập.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
          this.toastr.error(errorMessage);
        }
      });
    } else {
      this.toastr.warning('Vui lòng điền đầy đủ thông tin hợp lệ.');
      this.registerForm.markAllAsTouched();
    }
  }
}
