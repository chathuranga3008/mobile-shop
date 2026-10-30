import { Component, ViewChild } from '@angular/core';

import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';
import { Item } from './models/item.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItemList, ItemForm],
  template: `
    <app-item-form
      [selectedItem]="selectedItem"
      (itemAdded)="refreshItems()"
    />

    <app-item-list
      (editItem)="onEditItem($event)"
    />
  `,
  styleUrl: './app.css'
})
export class App {

  @ViewChild(ItemList) itemList!: ItemList;

  selectedItem: Item | null = null;

  onEditItem(item: Item): void {
    this.selectedItem = item;
  }

  refreshItems(): void {
    this.itemList.loadItems();
    this.selectedItem = null;
  }
}