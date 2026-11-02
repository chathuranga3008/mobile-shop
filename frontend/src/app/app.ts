import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <aside class="sidebar">
        <div class="logo">
          <h2>Mobile Shop</h2>
        </div>

        <nav>
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Dashboard
          </a>

          <a routerLink="/inventory" routerLinkActive="active"> Inventory </a>

          <a routerLink="/stock-history" routerLinkActive="active"> Stock History </a>

          <a routerLink="/sales" routerLinkActive="active"> Sales </a>

          <a routerLink="/sales-history" routerLinkActive="active"> Sales History </a>
        </nav>
      </aside>

      <div class="main-section">
        <header class="topbar">
          <h2>Mobile Shop Management System</h2>
        </header>

        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {}
