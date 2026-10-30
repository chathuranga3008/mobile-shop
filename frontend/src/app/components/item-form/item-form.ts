import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css'
})
export class ItemForm {

  item = {
    sku: '',
    name: '',
    brand: '',
    category: '',
    price: 0,
    quantity: 0,
    lowStockThreshold: 5
  };

  successMessage = '';
  errorMessage = '';

  constructor(private itemService: ItemService) {}

  saveItem(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.itemService.createItem(this.item).subscribe({
      next: (response) => {
        this.successMessage = 'Item added successfully!';
        console.log('Created item:', response);

        this.item = {
          sku: '',
          name: '',
          brand: '',
          category: '',
          price: 0,
          quantity: 0,
          lowStockThreshold: 5
        };
      },
      error: (error) => {
        console.error('Error creating item:', error);
        this.errorMessage =
          error.error?.message || 'Failed to add item.';
      }
    });
  }
}
