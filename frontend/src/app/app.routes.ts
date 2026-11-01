import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./components/item-list/item-list')
        .then(m => m.ItemList)
  },
  {
    path: 'stock-history',
    loadComponent: () =>
      import('./components/stock-history/stock-history')
        .then(m => m.StockHistory)
  },
  {
    path: 'sales',
    loadComponent: () =>
      import('./components/sales/sales')
        .then(m => m.Sales)
  },
  {
    path: 'sales-history',
    loadComponent: () =>
      import('./components/sales-history/sales-history')
        .then(m => m.SalesHistory)
  }
];
