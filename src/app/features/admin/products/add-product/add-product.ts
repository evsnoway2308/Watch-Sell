import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/model/category.model';

@Component({
    selector: 'app-add-product',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './add-product.html',
    styleUrl: './add-product.css'
})
export class AddProductComponent implements OnInit {
    productForm: FormGroup;
    categories: Category[] = [];
    isLoading = false;
    isSubmitted = false;

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private categoryService: CategoryService,
        private router: Router
    ) {
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', Validators.required],
            price: [null, [Validators.required, Validators.min(0)]],
            imageUrl: ['', Validators.required],
            categoryId: [null, Validators.required],
            stock: [0, [Validators.required, Validators.min(0)]],
            images: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.categoryService.getCategories().subscribe({
            next: (cats) => this.categories = cats,
            error: (err) => console.error('Error loading categories:', err)
        });
    }

    get extraImages() {
        return this.productForm.get('images') as FormArray;
    }

    addImage() {
        this.extraImages.push(this.fb.control('', Validators.required));
    }

    removeImage(index: number) {
        this.extraImages.removeAt(index);
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.productForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.productService.addProduct(this.productForm.value).subscribe({
            next: (response) => {
                alert('Thêm sản phẩm thành công!');
                this.router.navigate(['/admin/products']);
            },
            error: (err) => {
                console.error('Error adding product:', err);
                alert('Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại.');
                this.isLoading = false;
            }
        });
    }
}
