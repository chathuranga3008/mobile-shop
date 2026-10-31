import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Item } from '../models/item.model';
import { StockMovement } from '../models/stock-movement.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private apiUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  // Get all items
  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  // Get item by ID
  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  // Create item
  createItem(item: Omit<Item, 'id' | 'createdAt'>): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item);
  }

  // Update item
  updateItem(id: number, item: Omit<Item, 'id' | 'createdAt'>): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item);
  }

  // Restock item
  restockItem(id: number, quantityToAdd: number): Observable<Item> {
    return this.http.post<Item>(
      `${this.apiUrl}/${id}/restock`,
      null,
      {
        params: {
          quantityToAdd: quantityToAdd.toString()
        }
      }
    );
  }

  // Delete item
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get low-stock items
  getLowStockItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/low-stock`);
  }

  // Get stock movements
  getStockMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(
      `${this.apiUrl}/stock-movements`
    );
  }
}
