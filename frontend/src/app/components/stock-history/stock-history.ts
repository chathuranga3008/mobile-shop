import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockMovement } from '../../models/stock-movement.model';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-history.html',
  styleUrl: './stock-history.css'
})
export class StockHistory implements OnInit {

  movements: StockMovement[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStockMovements();
  }

  loadStockMovements(): void {
    this.loading = true;
    this.errorMessage = '';

    this.itemService.getStockMovements().subscribe({
      next: (data) => {
        this.movements = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Stock history error:', error);
        this.errorMessage = 'Failed to load stock movement history.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
