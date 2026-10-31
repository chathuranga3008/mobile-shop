import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css'
})
export class ItemList implements OnInit {

  @Output() editItem = new EventEmitter<Item>();
  @Output() itemDeleted = new EventEmitter<void>();

  items: Item[] = [];
  searchTerm = '';
  selectedBrand = '';
  selectedCategory = ''

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
        this.loadItems();
        this.itemDeleted.emit();
      },
      error: (error: any) => {
        console.error('Error deleting item:', error);

        this.errorMessage = 'Failed to delete item.';
      }
    });
  }

  get filteredItems(): Item[] {
    const search = this.searchTerm.toLowerCase().trim();

    return this.items.filter(item => {
      const matchesSearch =
        item.sku.toLowerCase().includes(search) ||
        item.name.toLowerCase().includes(search);

      const matchesBrand =
        !this.selectedBrand || item.brand === this.selectedBrand;

      const matchesCategory =
        !this.selectedCategory || item.category === this.selectedCategory;

      return matchesSearch && matchesBrand && matchesCategory;
    });
  }

  get brands(): string[] {
    return [...new Set(this.items.map(item => item.brand))].sort();
  }

  get categories(): string[] {
    const filteredItems = this.selectedBrand
      ? this.items.filter(item => item.brand === this.selectedBrand)
      : this.items;

    return [...new Set(filteredItems.map(item => item.category))].sort();
  }
}