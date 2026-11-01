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

export interface SaleHistory {
  saleId: number;
  saleNumber: string;
  saleDate: string;
  totalAmount: number;
  productCount: number;
  totalQuantity: number;
}

export interface SaleDetail {
  saleId: number;
  saleNumber: string;
  saleDate: string;
  totalAmount: number;
  saleItemId: number;
  itemId: number;
  sku: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}