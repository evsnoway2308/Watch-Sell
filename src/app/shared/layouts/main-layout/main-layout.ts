import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent],
    template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `
})
export class MainLayoutComponent { }
