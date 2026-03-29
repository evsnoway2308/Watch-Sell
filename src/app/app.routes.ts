import { Routes } from '@angular/router';
import { SignupComponent } from './features/auth/signup/signup';
import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';
import { GoogleCallbackComponent } from './features/auth/google-callback/google-callback.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail';
import { ProductListComponent } from './features/products/product-list/product-list';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout';
import { AdminDashboardComponent } from './features/admin/dashboard/dashboard';
import { AdminProductListComponent } from './features/admin/products/product-list/product-list';
import { AddProductComponent } from './features/admin/products/add-product/add-product';
import { CategoryListComponent } from './features/admin/categories/category-list/category-list';
import { AddCategoryComponent } from './features/admin/categories/add-category/add-category';
import { AdminUserListComponent } from './features/admin/users/user-list/user-list';
import { ProfileComponent } from './features/profile/profile';
import { CartComponent } from './features/cart/cart';
import { CheckoutComponent } from './features/checkout/checkout';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout';
import { OrderHistoryComponent } from './features/orders/order-history/order-history';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders.component';
import { AdminReviewListComponent } from './features/admin/reviews/admin-review-list';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: SignupComponent },
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'orders', component: OrderHistoryComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
    ]
  },
  { path: 'auth/google/callback', component: GoogleCallbackComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductListComponent },
      { path: 'products/new', component: AddProductComponent },
      { path: 'products/edit/:id', component: AddProductComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'categories/add', component: AddCategoryComponent },
      { path: 'categories/edit/:id', component: AddCategoryComponent },
      { path: 'users', component: AdminUserListComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'reviews', component: AdminReviewListComponent },
    ]
  }
];
