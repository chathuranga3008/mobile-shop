import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  items: Item[] = [];

  totalItems = 0;
  lowStockItems = 0;
  inventoryValue = 0;
  totalQuantity = 0;

  loading = false;
  errorMessage = '';

  constructor(
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
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
}
