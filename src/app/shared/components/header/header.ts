import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
    authService = inject(AuthService);
    userService = inject(UserService);
    router = inject(Router);

    user = signal<any>(null);
    showDropdown = false;

    constructor() {
        // Reactively upate user info when login state changes
        effect(() => {
            if (this.authService.isLoggedIn()) {
                this.fetchProfile();
            } else {
                this.user.set(null);
            }
        });
    }

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.fetchProfile();
        }
    }

    fetchProfile() {
        this.userService.getMyProfile().subscribe({
            next: (res) => {
                this.user.set(res);
            },
            error: () => {
                // If getting profile fails (e.g. invalid token), logout might be needed
                // But for now just leave user null
            }
        });
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }

    logout() {
        this.authService.logout();
        this.showDropdown = false;
    }
}
