import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './item-list.component.html',
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  loading = false;
  error = '';
  private readonly itemService = inject(ItemService);

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.error = '';

    this.itemService.getAll().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load inventory. Check that the backend is running.';
        this.loading = false;
        console.error(err);
      },
    });
  }

  deleteItem(item: Item): void {
    if (!confirm(`Delete ${item.name}?`)) {
      return;
    }

    this.itemService.delete(item.id).subscribe({
      next: () => this.loadItems(),
      error: (err) => {
        this.error = 'Could not delete the item.';
        console.error(err);
      },
    });
  }
}
