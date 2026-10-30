import { Component } from '@angular/core';
import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItemList, ItemForm],
  template: `
    <app-item-form />
    <app-item-list />
  `,
  styleUrl: './app.css'
})
export class App {}