import { Routes } from '@angular/router';

import { ItemListComponent } from './components/item-list/item-list';
import { ItemFormComponent } from './components/item-form/item-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },
  { path: 'items', component: ItemListComponent },
  { path: 'items/new', component: ItemFormComponent },
  { path: 'items/:id/edit', component: ItemFormComponent },
  { path: '**', redirectTo: 'items' },
];
