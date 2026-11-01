export interface SaleItemRequest {
  itemId: number;
  quantity: number;
}

export interface SaleRequest {
  items: SaleItemRequest[];
}

export interface SaleResponse {
  saleId: number;
  saleNumber: string;
  saleDate: string;
  totalAmount: number;
}