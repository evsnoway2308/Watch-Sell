import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../../shared/components/admin/sidebar/sidebar';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, AdminSidebarComponent],
    template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      <main class="admin-content">
        <header class="admin-header">
          <div class="header-left">
            <h2>Hệ thống quản trị</h2>
          </div>
          <div class="header-right">
            <div class="user-profile">
              <span class="user-name">Admin User</span>
              <div class="avatar">A</div>
            </div>
          </div>
        </header>
        <div class="content-body">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
    styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    .admin-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
    }

    .admin-header {
      height: 70px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .admin-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      font-weight: 500;
      color: #64748b;
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;
    }

    .content-body {
      padding: 2rem;
      flex: 1;
    }

    @media (max-width: 768px) {
      .admin-content {
        margin-left: 0;
      }
      /* Add toggle logic for mobile sidebar in future */
    }
  `]
})
export class AdminLayoutComponent { }
