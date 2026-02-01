import { Routes } from '@angular/router';
import { SignupComponent } from './features/auth/signup/signup';
import { LoginComponent } from './features/auth/login/login';
import { HomeComponent } from './features/home/home';
import { GoogleCallbackComponent } from './features/auth/google-callback/google-callback.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: SignupComponent },
  { path: 'auth/google/callback', component: GoogleCallbackComponent },
];
