import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockMovement } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-history.html',
  styleUrl: './stock-history.css'
})
export class StockHistory implements OnInit {
  movements: StockMovement[] = [];
  loading = false;
  errorMessage = '';

  startDate = '';
  endDate = '';
  searchSku = '';
  searchItemName = '';
  selectedMovementType = '';
  sortOrder: 'newest' | 'oldest' = 'newest';

  constructor(
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  get movementTypes(): string[] {
    return [...new Set(
      this.movements.map(movement => movement.movementType)
    )].sort();
  }

  get filteredMovements(): StockMovement[] {
    return this.movements
      .filter((movement) => {
        const movementDate = new Date(movement.createdAt);

        // Date range filter
        if (this.startDate) {
          const fromDate = new Date(this.startDate + 'T00:00:00');

          if (movementDate < fromDate) {
            return false;
          }
        }

        if (this.endDate) {
          const toDate = new Date(this.endDate + 'T23:59:59.999');

          if (movementDate > toDate) {
            return false;
          }
        }

        // SKU filter
        if (
          this.searchSku &&
          !movement.sku.toLowerCase().includes(this.searchSku.toLowerCase().trim())
        ) {
          return false;
        }

        // Item name filter
        if (
          this.searchItemName &&
          !movement.itemName.toLowerCase().includes(this.searchItemName.toLowerCase().trim())
        ) {
          return false;
        }

        // Movement type filter
        if (
          this.selectedMovementType &&
          movement.movementType !== this.selectedMovementType
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        return this.sortOrder === 'newest'
          ? dateB - dateA
          : dateA - dateB;
      });
  }

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
