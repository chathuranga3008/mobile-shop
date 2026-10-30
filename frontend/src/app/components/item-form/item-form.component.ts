import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ItemService } from '../../services/item.service';
import { ItemRequest } from '../../models/item.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './item-form.component.html',
})
export class ItemFormComponent implements OnInit {
  itemId: number | null = null;
  loading = false;
  saving = false;
  error = '';
  private readonly fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    brand: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [5, [Validators.required, Validators.min(0)]],
  });
  private readonly itemService = inject(ItemService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      this.itemId = Number(id);
      this.loadItem(this.itemId);
    }
  }

  loadItem(id: number): void {
    this.loading = true;

    this.itemService.getById(id).subscribe({
      next: (item) => {
        this.form.patchValue({
          sku: item.sku,
          name: item.name,
          brand: item.brand,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
          lowStockThreshold: item.lowStockThreshold,
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not find this item.';
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const request: ItemRequest = this.form.getRawValue();
    this.saving = true;
    this.error = '';

    const operation =
      this.itemId === null
        ? this.itemService.create(request)
        : this.itemService.update(this.itemId, request);

    operation.subscribe({
      next: () => this.router.navigate(['/items']),
      error: (err) => {
        this.error = err.error?.message ?? 'Could not save the item. Check the SKU and try again.';
        this.saving = false;
      },
    });
  }
}
