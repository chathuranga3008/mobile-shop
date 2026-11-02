import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css'
})
export class ItemForm implements OnChanges {
  @Input() selectedItem: Item | null = null;
  @Output() itemAdded = new EventEmitter<void>();
  @Output() closeForm = new EventEmitter<void>();

  item = {
    sku: '',
    name: '',
    brand: '',
    category: '',
    price: 0,
    quantity: 0,
    lowStockThreshold: 5
  };

  isEditMode = false;
  successMessage = '';
  errorMessage = '';

  constructor(private itemService: ItemService) {}

  saveItem(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isEditMode && this.selectedItem) {
      // Update existing item
      this.itemService.updateItem(this.selectedItem.id, this.item).subscribe({
        next: (response) => {
          this.successMessage = 'Item updated successfully!';

          this.itemAdded.emit();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating item:', error);
          this.errorMessage = error.error?.message || 'Failed to update item.';
        }
      });
    } else {
      // Create new item
      this.itemService.createItem(this.item).subscribe({
        next: (response) => {
          this.successMessage = 'Item added successfully!';

          this.itemAdded.emit();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating item:', error);
          this.errorMessage = error.error?.message || 'Failed to add item.';
        }
      });
    }
  }

  resetForm(): void {
    this.item = {
      sku: '',
      name: '',
      brand: '',
      category: '',
      price: 0,
      quantity: 0,
      lowStockThreshold: 5
    };

    this.isEditMode = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItem'] && this.selectedItem) {
      this.isEditMode = true;

      this.item = {
        sku: this.selectedItem.sku,
        name: this.selectedItem.name,
        brand: this.selectedItem.brand,
        category: this.selectedItem.category,
        price: this.selectedItem.price,
        quantity: this.selectedItem.quantity,
        lowStockThreshold: this.selectedItem.lowStockThreshold
      };

      this.successMessage = '';
      this.errorMessage = '';
    }
  }
}
