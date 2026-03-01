import { Routes } from '@angular/router';
import { SignupComponent } from './features/auth/signup/signup';
import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';
import { GoogleCallbackComponent } from './features/auth/google-callback/google-callback.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout';
import { AdminDashboardComponent } from './features/admin/dashboard/dashboard';
import { AdminProductListComponent } from './features/admin/products/product-list/product-list';
import { AddProductComponent } from './features/admin/products/add-product/add-product';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: SignupComponent },
      { path: 'products/:id', component: ProductDetailComponent },
    ]
  },
  { path: 'auth/google/callback', component: GoogleCallbackComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductListComponent },
      { path: 'products/new', component: AddProductComponent },
      // Future admin routes will go here
    ]
  }
];
