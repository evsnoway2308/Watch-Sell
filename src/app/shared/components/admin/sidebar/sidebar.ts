import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-admin-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">⌚</span>
          <span class="logo-text">Admin Panel</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li>
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="icon">📊</span> Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/admin/products" routerLinkActive="active">
              <span class="icon">📦</span> Sản phẩm
            </a>
          </li>
          <li>
            <a routerLink="/admin/orders" routerLinkActive="active">
              <span class="icon">🛒</span> Đơn hàng
            </a>
          </li>
          <li>
            <a routerLink="/admin/users" routerLinkActive="active">
              <span class="icon">👥</span> Người dùng
            </a>
          </li>
          <li>
            <a routerLink="/admin/categories" routerLinkActive="active">
              <span class="icon">📁</span> Danh mục
            </a>
          </li>
          <li>
            <a routerLink="/admin/reviews" routerLinkActive="active">
              <span class="icon">💬</span> Đánh giá
            </a>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <a routerLink="/" class="back-home">
          <span class="icon">🏠</span> Quay lại Shop
        </a>
      </div>
    </aside>
  `,
    styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: #1e293b;
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
    }

    .sidebar-header {
      padding: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 0;
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 2rem;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s;
      font-weight: 500;
    }

    .sidebar-nav a:hover {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .sidebar-nav a.active {
      background: #3b82f6;
      color: white;
    }

    .icon {
      font-size: 1.25rem;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .back-home {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .back-home:hover {
      color: white;
    }
  `]
})
export class AdminSidebarComponent { }
