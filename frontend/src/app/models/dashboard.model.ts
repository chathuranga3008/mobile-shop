export interface DashboardSummary {
  totalItems: number;
  totalQuantity: number;
  healthyStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  potentialStockSalesValue: number;
  totalSales: number;
  totalRevenue: number;
  totalUnitsSold: number;
}

export interface TopSellingProduct {
  itemId: number;
  sku: string;
  itemName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}