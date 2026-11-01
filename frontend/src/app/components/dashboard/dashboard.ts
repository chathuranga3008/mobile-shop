import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary } from '../../models/dashboard-summary.model';

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

  dashboardSummary: DashboardSummary | null = null;

  totalItems = 0;
  lowStockItems = 0;
  inventoryValue = 0;
  totalQuantity = 0;
  healthyStockItems = 0;
  outOfStockItems = 0;
  lowStockOnlyItems = 0;

  totalSales = 0;
  totalRevenue = 0;
  totalUnitsSold = 0;

  restockQuantity = 1;

  startDate = '';
  endDate = '';

  loading = false;
  errorMessage = '';

  constructor(
    private itemService: ItemService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.loadDashboard();
    this.loadLowStockItems();
  }

  setDefaultDateRange(): void {
    const today = new Date();

    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(today);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    // Load inventory items for the stock distribution
    this.itemService.getAllItems().subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Dashboard inventory loading error:', error);
        this.errorMessage = 'Failed to load dashboard data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    // Load dashboard statistics from the backend
    this.loadDashboardSummary();
  }

  loadDashboardSummary(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    if (this.startDate > this.endDate) {
      this.errorMessage = 'Start date cannot be after end date.';
      return;
    }

    this.dashboardService.getDashboardSummary(
      this.startDate,
      this.endDate
    ).subscribe({
      next: (data: DashboardSummary) => {
        this.dashboardSummary = data;

        this.totalItems = data.totalItems;
        this.totalQuantity = data.totalQuantity;

        this.healthyStockItems = data.healthyStockItems;
        this.lowStockOnlyItems = data.lowStockItems;
        this.outOfStockItems = data.outOfStockItems;

        this.lowStockItems =
          data.lowStockItems + data.outOfStockItems;

        this.inventoryValue = data.potentialStockSalesValue;

        this.totalSales = data.totalSales;
        this.totalRevenue = data.totalRevenue;
        this.totalUnitsSold = data.totalUnitsSold;

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Dashboard summary loading error:', error);
        this.errorMessage = 'Failed to load dashboard statistics.';
        this.cdr.detectChanges();
      }
    });
  }

  applyDateFilter(): void {
    this.loadDashboardSummary();
  }

  loadLowStockItems(): void {
    this.itemService.getLowStockItems().subscribe({
      next: (data: Item[]) => {
        this.lowStockItemsList = data;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading low-stock items:', error);
        this.cdr.detectChanges();
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
