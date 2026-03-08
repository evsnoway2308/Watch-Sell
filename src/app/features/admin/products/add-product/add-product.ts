import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ModalService } from '../../../../core/services/modal.service';
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
    isEditMode = false;
    productId?: number;

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private categoryService: CategoryService,
        private modalService: ModalService,
        private router: Router,
        private route: ActivatedRoute
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
        this.checkEditMode();
    }

    checkEditMode(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.productId = +id;
            this.loadProductDetails(this.productId);
        }
    }

    loadProductDetails(id: number): void {
        this.isLoading = true;
        this.productService.getProductById(id).subscribe({
            next: (product) => {
                this.productForm.patchValue({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    categoryId: this.categories.find(c => c.name === product.categoryName)?.id, // Temporary mapping, ideally ID should be in response
                    stock: product.stock
                });

                if (product.images) {
                    const imageArray = this.productForm.get('images') as FormArray;
                    imageArray.clear();
                    product.images.forEach(img => {
                        imageArray.push(this.fb.control(img, Validators.required));
                    });
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading product details:', err);
                this.modalService.alert({
                    title: 'Lỗi tải dữ liệu',
                    message: 'Không thể tải thông tin sản phẩm.'
                }).then(() => {
                    this.router.navigate(['/admin/products']);
                });
            }
        });
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

    onFileSelected(event: any, index?: number): void {
        const file: File = event.target.files[0];
        if (file) {
            this.isLoading = true;
            this.productService.uploadProductImage(file).subscribe({
                next: (res) => {
                    if (index !== undefined) {
                        this.extraImages.at(index).setValue(res.url);
                    } else {
                        this.productForm.patchValue({ imageUrl: res.url });
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error uploading image:', err);
                    this.modalService.alert({
                        title: 'Lỗi tải ảnh',
                        message: 'Lỗi khi tải ảnh lên. Vui lòng thử lại.'
                    });
                    this.isLoading = false;
                }
            });
        }
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.productForm.invalid) {
            return;
        }

        this.isLoading = true;
        if (this.isEditMode && this.productId) {
            this.productService.updateProduct(this.productId, this.productForm.value).subscribe({
                next: () => {
                    this.modalService.alert({
                        title: 'Thành công',
                        message: 'Cập nhật sản phẩm thành công!'
                    }).then(() => {
                        this.router.navigate(['/admin/products']);
                    });
                },
                error: (err) => {
                    console.error('Error updating product:', err);
                    this.modalService.alert({
                        title: 'Lỗi',
                        message: 'Có lỗi xảy ra khi cập nhật sản phẩm.'
                    });
                    this.isLoading = false;
                }
            });
        } else {
            this.productService.addProduct(this.productForm.value).subscribe({
                next: () => {
                    this.modalService.alert({
                        title: 'Thành công',
                        message: 'Thêm sản phẩm thành công!'
                    }).then(() => {
                        this.router.navigate(['/admin/products']);
                    });
                },
                error: (err) => {
                    console.error('Error adding product:', err);
                    this.modalService.alert({
                        title: 'Lỗi',
                        message: 'Có lỗi xảy ra khi thêm sản phẩm.'
                    });
                    this.isLoading = false;
                }
            });
        }
    }
}
