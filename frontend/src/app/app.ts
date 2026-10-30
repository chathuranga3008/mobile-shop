import { Component } from '@angular/core';
import { ItemList } from './components/item-list/item-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItemList],
  template: '<app-item-list />',
  styleUrl: './app.css'
})
export class App {}