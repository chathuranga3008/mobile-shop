import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  @Output() itemRestocked = new EventEmitter<void>();

  items: Item[] = [];
  lowStockItemsList: Item[] = [];
  
  totalItems = 0;
  lowStockItems = 0;
  inventoryValue = 0;
  totalQuantity = 0;
  restockQuantity = 1;

  loading = false;
  errorMessage = '';

  constructor(
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadLowStockItems();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.itemService.getAllItems().subscribe({
      next: (data: Item[]) => {

        this.items = data;

        // Total number of inventory records
        this.totalItems = this.items.length;

        // Number of items that have low stock
        this.lowStockItems = this.items.filter(
          item => item.quantity <= item.lowStockThreshold
        ).length;

        // Total inventory value
        this.inventoryValue = this.items.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );

        // Total units available
        this.totalQuantity = this.items.reduce(
          (total, item) => total + item.quantity,
          0
        );

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error: any) => {
        console.error('Dashboard loading error:', error);

        this.errorMessage = 'Failed to load dashboard data.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  loadLowStockItems(): void {
    this.itemService.getLowStockItems().subscribe({
      next: (data: Item[]) => {
        this.lowStockItemsList = data;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading low-stock items:', error);
      }
    });
  }

  restockItem(item: Item): void {
    if (!Number.isInteger(this.restockQuantity) || this.restockQuantity <= 0) {
      alert('Please enter a valid whole number greater than 0.');
      return;
    }

    this.itemService.restockItem(item.id, this.restockQuantity).subscribe({
      next: () => {
        alert('Item restocked successfully!');

        this.itemRestocked.emit();

        this.restockQuantity = 1;
        this.loadDashboard();
        this.loadLowStockItems();
      },
      error: (error) => {
        console.error('Restock error:', error);
        alert('Failed to restock item. Please try again.');
      }
    });
  }
}
