import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(private itemService: ItemService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.itemService.getAllItems().subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading items:', error);

        this.errorMessage = 'Unable to load items. Please try again.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  // loadItems(): void {
  //   console.log('Loading items started');

  //   this.loading = true;
  //   this.errorMessage = '';

  //   this.itemService.getAllItems().subscribe({
  //     next: (data: Item[]) => {
  //       console.log('Items received:', data);

  //       this.items = data;
  //       console.log('Number of items:', this.items.length);
  //       this.loading = false;

  //       console.log('Loading completed:', this.loading);
  //     },
  //     error: (error: any) => {
  //       console.error('Error loading items:', error);

  //       this.errorMessage = 'Unable to load items. Please try again.';
  //       this.loading = false;
  //     },
  //     complete: () => {
  //       console.log('HTTP request completed');
  //     }
  //   });
  // }
}