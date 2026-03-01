import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-container">
      <h1 class="page-title">Tổng quan hệ thống</h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon products">📦</div>
          <div class="stat-info">
            <h3>Sản phẩm</h3>
            <p class="number">128</p>
            <p class="trend up">↑ 12% so với tháng trước</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon orders">🛒</div>
          <div class="stat-info">
            <h3>Đơn hàng</h3>
            <p class="number">45</p>
            <p class="trend up">↑ 8% so với tháng trước</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon users">👥</div>
          <div class="stat-info">
            <h3>Khách hàng</h3>
            <p class="number">1,240</p>
            <p class="trend up">↑ 5% so với tháng trước</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon revenue">💰</div>
          <div class="stat-info">
            <h3>Doanh thu</h3>
            <p class="number">85M VNĐ</p>
            <p class="trend up">↑ 15% so với tháng trước</p>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="chart-section card">
          <h3>Sản phẩm mới cập nhật</h3>
          <div class="recent-list">
            <div class="recent-item" *ngFor="let i of [1,2,3,4]">
              <div class="item-img"></div>
              <div class="item-info">
                <p class="item-name">Rolex Submariner Gold</p>
                <p class="item-date">2 giờ trước</p>
              </div>
              <span class="item-price">12,500,000 VNĐ</span>
            </div>
          </div>
        </div>

        <div class="recent-orders card">
          <h3>Đơn hàng mới nhất</h3>
          <table>
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of [1,2,3,4]">
                <td>#ORD-8821</td>
                <td>Nguyen Van A</td>
                <td><span class="badge success">Đã giao</span></td>
                <td>8,500,000 VNĐ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border: 1px solid #e2e8f0;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-icon.products { background: #eff6ff; color: #3b82f6; }
    .stat-icon.orders { background: #fdf2f8; color: #ec4899; }
    .stat-icon.users { background: #f0fdf4; color: #22c55e; }
    .stat-icon.revenue { background: #fff7ed; color: #f59e0b; }

    .stat-info h3 {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .stat-info .number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .stat-info .trend {
      font-size: 0.75rem;
      font-weight: 600;
    }

    .trend.up { color: #10b981; }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .card h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1.5rem;
    }

    .recent-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .item-img {
      width: 40px;
      height: 40px;
      background: #f1f5f9;
      border-radius: 8px;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.875rem;
    }

    .item-date {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .item-price {
      font-weight: 700;
      color: #3b82f6;
      font-size: 0.875rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 0.75rem 0;
      font-size: 0.875rem;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }

    td {
      padding: 1rem 0;
      font-size: 0.875rem;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge.success { background: #f0fdf4; color: #16a34a; }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent { }
