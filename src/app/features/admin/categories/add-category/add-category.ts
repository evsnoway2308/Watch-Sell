import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-add-category',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="admin-add-category">
      <div class="page-header">
        <div class="header-info">
          <h1>{{ isEditMode ? 'Chỉnh sửa' : 'Thêm' }} danh mục</h1>
          <nav class="breadcrumb">
            <a routerLink="/admin/categories">Danh mục</a> / 
            <span>{{ isEditMode ? 'Chỉnh sửa' : 'Thêm mới' }}</span>
          </nav>
        </div>
      </div>

      <div class="card form-container">
        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Tên danh mục <span class="required">*</span></label>
              <input 
                type="text" 
                id="name" 
                formControlName="name" 
                placeholder="Ví dụ: Đồng hồ thông minh"
                [class.error]="isFieldInvalid('name')"
              >
              <div class="error-msg" *ngIf="isFieldInvalid('name')">
                Tên danh mục là bắt buộc
              </div>
            </div>

            <div class="form-group full-width">
              <label for="description">Mô tả</label>
              <textarea 
                id="description" 
                formControlName="description" 
                rows="4" 
                placeholder="Mô tả về danh mục này..."
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-ghost" routerLink="/admin/categories">Hủy</button>
            <button type="submit" class="btn-primary" [disabled]="categoryForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm danh mục') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .admin-add-category {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 800px;
    }

    .page-header {
      margin-bottom: 1rem;
    }

    .header-info h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .breadcrumb {
      color: #64748b;
      font-size: 0.875rem;
    }

    .breadcrumb a {
      color: #3b82f6;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .form-container {
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      gap: 1.5rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
      color: #475569;
      font-size: 0.875rem;
    }

    .required {
      color: #ef4444;
    }

    input, textarea {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    input.error {
      border-color: #ef4444;
    }

    .error-msg {
      color: #ef4444;
      font-size: 0.75rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #f1f5f9;
    }
  `]
})
export class AddCategoryComponent implements OnInit {
    private fb = inject(FormBuilder);
    private categoryService = inject(CategoryService);
    private toastr = inject(ToastrService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    categoryForm: FormGroup;
    isEditMode = false;
    categoryId?: number;
    isSubmitting = false;

    constructor() {
        this.categoryForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['']
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.categoryId = +id;
            this.loadCategoryDetails(this.categoryId);
        }
    }

    loadCategoryDetails(id: number): void {
        this.categoryService.getCategoryById(id).subscribe({
            next: (cat) => {
                this.categoryForm.patchValue({
                    name: cat.name,
                    description: cat.description
                });
            },
            error: (err) => {
                console.error('Error loading category:', err);
                this.toastr.error('Không thể tải thông tin danh mục');
            }
        });
    }

    isFieldInvalid(field: string): boolean {
        const control = this.categoryForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onSubmit(): void {
        if (this.categoryForm.invalid) return;

        this.isSubmitting = true;
        const observer = {
            next: () => {
                this.toastr.success(`${this.isEditMode ? 'Cập nhật' : 'Thêm'} danh mục thành công`);
                this.router.navigate(['/admin/categories']);
            },
            error: (err: any) => {
                console.error('Error saving category:', err);
                this.toastr.error('Lỗi khi lưu danh mục');
                this.isSubmitting = false;
            }
        };

        if (this.isEditMode && this.categoryId) {
            this.categoryService.updateCategory(this.categoryId, this.categoryForm.value).subscribe(observer);
        } else {
            this.categoryService.addCategory(this.categoryForm.value).subscribe(observer);
        }
    }
}
