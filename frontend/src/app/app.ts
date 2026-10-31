import { Component, ViewChild } from '@angular/core';

import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';
import { Item } from './models/item.model';
import { Dashboard } from './components/dashboard/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItemList, ItemForm, Dashboard],
  template: `
    <app-dashboard
      (itemRestocked)="refreshItems()"
    />

    <app-item-form
      [selectedItem]="selectedItem"
      (itemAdded)="refreshItems()"
    />

    <app-item-list
      (editItem)="onEditItem($event)"
      (itemDeleted)="refreshItems()"
    />
  `,
  styleUrl: './app.css'
})
export class App {

  @ViewChild(ItemList) itemList!: ItemList;
  @ViewChild(Dashboard) dashboard!: Dashboard;

  selectedItem: Item | null = null;

  onEditItem(item: Item): void {
    this.selectedItem = item;
  }

  refreshItems(): void {
    this.itemList.loadItems();
    this.dashboard.loadDashboard();
    this.dashboard.loadLowStockItems();
    this.selectedItem = null;
  }
}