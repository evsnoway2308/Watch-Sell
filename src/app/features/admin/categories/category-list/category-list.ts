import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';
import { ModalService } from '../../../../core/services/modal.service';
import { Category } from '../../../../core/model/category.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-categories">
      <div class="page-header">
        <div class="header-info">
          <h1>Danh mục sản phẩm</h1>
          <p>Quản lý các danh mục sản phẩm trong hệ thống</p>
        </div>
        <button class="btn-primary" routerLink="/admin/categories/add">
          <span class="icon">+</span> Thêm danh mục
        </button>
      </div>

      <div class="card table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th class="actions-cell">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of categories">
              <td>#{{ cat.id }}</td>
              <td><strong>{{ cat.name }}</strong></td>
              <td>{{ cat.description }}</td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button class="btn-icon edit" [routerLink]="['/admin/categories/edit', cat.id]" title="Chỉnh sửa">
                    ✏️
                  </button>
                  <button class="btn-icon delete" (click)="onDelete(cat)" title="Xóa">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="categories.length === 0">
              <td colspan="4" class="empty-state">Không có danh mục nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-categories {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .header-info p {
      color: #64748b;
    }

    .table-container {
      overflow-x: auto;
      padding: 0;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .admin-table th {
      background: #f8fafc;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #475569;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
    }

    .admin-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .actions-cell {
      text-align: right;
      width: 120px;
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
    }

    .btn-icon:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-icon.edit:hover {
      color: #3b82f6;
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .btn-icon.delete:hover {
      color: #ef4444;
      border-color: #ef4444;
      background: #fef2f2;
    }

    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: #94a3b8;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toastr = inject(ToastrService);
  private modalService = inject(ModalService);

  categories: Category[] = [];

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => {
        console.error('Error loading categories:', err);
        this.toastr.error('Không thể tải danh sách danh mục');
      }
    });
  }

  async onDelete(category: Category) {
    const confirmed = await this.modalService.confirm({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa danh mục "${category.name}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.toastr.success('Xóa danh mục thành công');
          this.loadCategories();
        },
        error: (err) => {
          console.error('Error deleting category:', err);
          this.toastr.error('Lỗi khi xóa danh mục. Có thể vẫn còn sản phẩm thuộc danh mục này.');
        }
      });
    }
  }
}
