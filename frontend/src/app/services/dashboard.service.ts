import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { DashboardSummary, TopSellingProduct } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  // Get dashboard summary
  getDashboardSummary(
    startDate: string,
    endDate: string
  ): Observable<DashboardSummary> {

    return this.http.get<DashboardSummary>(
      `${this.apiUrl}/summary`,
      {
        params: new HttpParams()
          .set('startDate', startDate)
          .set('endDate', endDate)
      }
    );
  }

  // Get top-selling products
  getTopSellingProducts(
    startDate: string,
    endDate: string
  ): Observable<TopSellingProduct[]> {

    return this.http.get<TopSellingProduct[]>(
      `${this.apiUrl}/top-selling-products`,
      {
        params: new HttpParams()
          .set('startDate', startDate)
          .set('endDate', endDate)
      }
    );
  }
}
