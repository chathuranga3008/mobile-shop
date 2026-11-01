import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Item } from '../../models/item.model';
import { SaleRequest } from '../../models/sale.model';
import { ItemService } from '../../services/item.service';
import { SaleService } from '../../services/sale.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales.html',
  styleUrl: './sales.css'
})
export class Sales implements OnInit {

  items: Item[] = [];
  isLoading = false;
  errorMessage = '';
  quantities: { [itemId: number]: number } = {};
  cartItems: { item: Item; quantity: number }[] = [];
  cartMessage = '';
  isProcessingSale = false;
  saleSuccessMessage = '';
  saleErrorMessage = '';

  constructor(
    private itemService: ItemService,
    private saleService: SaleService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadItems();
  }

  // Load available inventory items
  loadItems(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load inventory items.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getQuantity(itemId: number): number {
    return this.quantities[itemId] || 1;
  }

  increaseQuantity(item: Item): void {
    const currentQuantity = this.getQuantity(item.id);

    if (currentQuantity < item.quantity) {
      this.quantities[item.id] = currentQuantity + 1;
    }
  }

  decreaseQuantity(itemId: number): void {
    const currentQuantity = this.getQuantity(itemId);

    if (currentQuantity > 1) {
      this.quantities[itemId] = currentQuantity - 1;
    }
  }

  addToCart(item: Item): void {
    const selectedQuantity = this.getQuantity(item.id);

    if (item.quantity <= 0) {
      this.cartMessage = 'This product is out of stock.';
      return;
    }

    const existingItem = this.cartItems.find(
      cartItem => cartItem.item.id === item.id
    );

    const totalQuantity = (existingItem?.quantity || 0) + selectedQuantity;

    if (totalQuantity > item.quantity) {
      this.cartMessage = 'Not enough stock available for this quantity.';
      return;
    }

    if (existingItem) {
      existingItem.quantity = totalQuantity;
    } else {
      this.cartItems.push({
        item: item,
        quantity: selectedQuantity
      });
    }

    this.cartMessage = '';
  }

  getCartTotal(): number {
    return this.cartItems.reduce(
      (total, cartItem) =>
        total + (cartItem.item.price * cartItem.quantity),
      0
    );
  }

  removeFromCart(itemId: number): void {
    this.cartItems = this.cartItems.filter(
      cartItem => cartItem.item.id !== itemId
    );
  }

  checkout(): void {
    if (this.cartItems.length === 0 || this.isProcessingSale) {
      return;
    }

    const saleRequest: SaleRequest = {
      items: this.cartItems.map(cartItem => ({
        itemId: cartItem.item.id,
        quantity: cartItem.quantity
      }))
    };

    this.isProcessingSale = true;
    this.saleSuccessMessage = '';
    this.saleErrorMessage = '';

    this.saleService.createSale(saleRequest).subscribe({
      next: (response) => {
        this.saleSuccessMessage =
          `Sale ${response.saleNumber} completed successfully.`;

        this.cartItems = [];
        this.quantities = {};
        this.isProcessingSale = false;

        this.loadItems();
        this.cdr.detectChanges();
      },
      error: () => {
        this.saleErrorMessage =
          'Failed to complete sale. Please check stock availability and try again.';

        this.isProcessingSale = false;
        this.cdr.detectChanges();
      }
    });
  }
}