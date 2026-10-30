import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css'
})
export class ItemList implements OnInit {

  @Output() editItem = new EventEmitter<Item>();

  items: Item[] = [];
  loading = false;
  errorMessage = '';

  showLowStockOnly = false;

  constructor(private itemService: ItemService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.itemService.getAllItems().subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading items:', error);

        this.errorMessage = 'Unable to load items. Please try again.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  loadLowStockItems(): void {
    this.loading = true;
    this.errorMessage = '';

    this.itemService.getLowStockItems().subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading low-stock items:', error);
        this.errorMessage = 'Failed to load low-stock items.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteItem(id: number): void {
    const confirmed = confirm(
      'Are you sure you want to delete this item?'
    );

    if (!confirmed) {
      return;
    }

    this.itemService.deleteItem(id).subscribe({
      next: () => {
        console.log('Item deleted successfully');

        this.loadItems();
      },
      error: (error: any) => {
        console.error('Error deleting item:', error);

        this.errorMessage = 'Failed to delete item.';
      }
    });
  }
}