import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css'
})
export class ItemList implements OnInit {

  items: Item[] = [];
  loading = false;
  errorMessage = '';

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';

    this.itemService.getAllItems().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.errorMessage = 'Unable to load items. Please try again.';
        this.loading = false;
      }
    });
  }
}