import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Item } from '../../models/item.model';
import { DashboardSummary, TopSellingProduct } from '../../models/dashboard.model';
import { SaleHistory } from '../../models/sale.model';

import { ItemService } from '../../services/item.service';
import { DashboardService } from '../../services/dashboard.service';
import { SaleService } from '../../services/sale.service';

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
  recentSales: SaleHistory[] = [];
  topSellingProducts: TopSellingProduct[] = [];

  dashboardSummary: DashboardSummary | null = null;

  totalItems = 0;
  totalQuantity = 0;
  healthyStockItems = 0;
  lowStockItems = 0;
  outOfStockItems = 0;
  inventoryValue = 0;
  totalSales = 0;
  totalRevenue = 0;
  totalUnitsSold = 0;

  lowStockOnlyItems = 0;
  restockQuantity = 1;

  recentSalesError = '';
  topSellingProductsError = '';

  startDate = '';
  endDate = '';

  selectedDateRange = 'custom';

  loading = false;
  errorMessage = '';

  constructor(
    private itemService: ItemService,
    private dashboardService: DashboardService,
    private saleService: SaleService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.loadDashboard();
    this.loadLowStockItems();
    this.loadRecentSales();
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

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    // Load inventory items for stock distribution
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

    // Load dashboard statistics
    this.loadDashboardSummary();

    // Load top-selling products
    this.loadTopSellingProducts();
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
        this.inventoryValue = data.potentialStockSalesValue;
        this.totalSales = data.totalSales;
        this.totalRevenue = data.totalRevenue;
        this.totalUnitsSold = data.totalUnitsSold;

        this.lowStockItems =
          data.lowStockItems + data.outOfStockItems;

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Dashboard summary loading error:', error);
        this.errorMessage = 'Failed to load dashboard statistics.';
        this.cdr.detectChanges();
      }
    });
  }

  // Load top-selling products for the selected date range
  loadTopSellingProducts(): void {
    this.topSellingProductsError = '';

    if (!this.startDate || !this.endDate) {
      return;
    }

    if (this.startDate > this.endDate) {
      this.topSellingProductsError =
        'Start date cannot be after end date.';
      return;
    }

    this.dashboardService.getTopSellingProducts(
      this.startDate,
      this.endDate
    ).subscribe({
      next: (data: TopSellingProduct[]) => {
        this.topSellingProducts = data;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Top-selling products loading error:', error);
        this.topSellingProductsError =
          'Failed to load top-selling products.';
        this.cdr.detectChanges();
      }
    });
  }

  // Apply predefined sales date ranges
  applyQuickDateRange(days: number): void {
    const today = new Date();

    const start = new Date(today);
    start.setDate(today.getDate() - days + 1);

    this.startDate = this.formatDate(start);
    this.endDate = this.formatDate(today);

    this.selectedDateRange = days.toString();

    this.applyDateFilter();
  }

  applyDateFilter(): void {
    this.loadDashboardSummary();
    this.loadTopSellingProducts();
    this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Restock error:', error);
        alert('Failed to restock item. Please try again.');
      }
    });
  }

  loadRecentSales(): void {
    this.recentSalesError = '';

    this.saleService.getSalesHistory().subscribe({
      next: (data: SaleHistory[]) => {
        this.recentSales = data.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Recent sales loading error:', error);
        this.recentSalesError = 'Failed to load recent sales.';
        this.cdr.detectChanges();
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}