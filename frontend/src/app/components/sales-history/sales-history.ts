import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SaleService } from '../../services/sale.service';
import { SaleHistory, SaleDetail } from '../../models/sale.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css'
})
export class SalesHistory implements OnInit {

  sales: SaleHistory[] = [];
  filteredSales: SaleHistory[] = [];

  selectedSale: SaleDetail[] = [];

  loading = false;
  errorMessage = '';

  searchTerm = '';
  startDate = '';
  endDate = '';

  constructor(private saleService: SaleService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadSalesHistory();
  }

  // Load sales history
  loadSalesHistory(): void {

    this.loading = true;
    this.errorMessage = '';

    this.saleService.getSalesHistory().subscribe({
      next: (data) => {
        this.sales = data;
        this.filteredSales = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load sales history:', error);
        this.errorMessage = 'Failed to load sales history.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filter sales history
  filterSales(): void {

    const search = this.searchTerm.toLowerCase().trim();

    this.filteredSales = this.sales.filter(sale => {

      const matchesSearch =
        sale.saleNumber.toLowerCase().includes(search);

      const saleDate = sale.saleDate.substring(0, 10);

      const matchesStartDate =
        !this.startDate || saleDate >= this.startDate;

      const matchesEndDate =
        !this.endDate || saleDate <= this.endDate;

      return matchesSearch &&
        matchesStartDate &&
        matchesEndDate;
    });
  }

  // View sale details
viewSaleDetails(saleId: number): void {

  this.selectedSale = [];
  this.errorMessage = '';

  this.saleService.getSaleDetails(saleId).subscribe({
    next: (data) => {
      this.selectedSale = data;
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Failed to load sale details:', error);
      this.errorMessage = 'Failed to load sale details.';
      this.cdr.detectChanges();
    }
  });
}

// Close sale details
closeSaleDetails(): void {
  this.selectedSale = [];
}
}