import { Component, ViewChild } from '@angular/core';

import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItemList, ItemForm],
  template: `
    <app-item-form (itemAdded)="refreshItems()" />
    <app-item-list />
  `,
  styleUrl: './app.css'
})
export class App {

  @ViewChild(ItemList) itemList!: ItemList;

  refreshItems(): void {
    this.itemList.loadItems();
  }
}