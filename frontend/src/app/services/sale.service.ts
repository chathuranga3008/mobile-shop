import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SaleDetail, SaleHistory, SaleRequest, SaleResponse } from '../models/sale.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SaleService {

    private apiUrl = `${environment.apiUrl}/sales`;

    constructor(private http: HttpClient) { }

    // Create a sale
    createSale(sale: SaleRequest): Observable<SaleResponse> {
        return this.http.post<SaleResponse>(this.apiUrl, sale);
    }

    // Get sales history
    getSalesHistory(): Observable<SaleHistory[]> {
        return this.http.get<SaleHistory[]>(this.apiUrl);
    }

    // Get sale details
    getSaleDetails(saleId: number): Observable<SaleDetail[]> {
        return this.http.get<SaleDetail[]>(`${this.apiUrl}/${saleId}`);
    }
}
