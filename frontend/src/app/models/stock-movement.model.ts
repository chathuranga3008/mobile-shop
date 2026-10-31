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
