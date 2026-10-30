export interface Item {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  createdAt: string;
}