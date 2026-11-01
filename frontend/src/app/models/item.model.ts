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

export interface StockMovement {
  id: number;
  itemId: number;
  itemName: string;
  sku: string;
  previousQuantity: number;
  quantityChanged: number;
  newQuantity: number;
  movementType: string;
  createdAt: string;
}
