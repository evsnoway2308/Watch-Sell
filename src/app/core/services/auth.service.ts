import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID); // 1. Inject PLATFORM_ID

  // 2. Khởi tạo mặc định là false để tránh lỗi trên Server
  isLoggedIn = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private cartService: CartService
  ) {
    // 3. Chỉ kiểm tra token nếu đang ở trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn.set(this.hasToken());
    }
  }

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (!token) return false;

      const parts = token.split('.');
      if (parts.length !== 3) return true; // Trả về true nếu token không phải JWT (opaque token)

      try {
        const payload = JSON.parse(atob(parts[1]));
        const isExpired = payload.exp && (payload.exp * 1000) < Date.now();
        if (isExpired) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_avatar');
          this.cartService.resetCart();
          return false;
        }
        return true;
      } catch (e) {
        return true; // Nếu lỗi parse nhưng có token thì vẫn coi như là login
      }
    }
    return false;
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
        }
        this.isLoggedIn.set(true);
        this.cartService.loadCart();
      })
    );
  }

  signup(userData: any) {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  loginWithGoogle(code: string) {
    return this.http.post<any>(`${this.apiUrl}/google`, { code }).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
        }
        this.isLoggedIn.set(true);
        this.cartService.loadCart();
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.cartService.resetCart();
    }
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}