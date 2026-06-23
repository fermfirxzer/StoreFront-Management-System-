export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: string;
}

export interface Order {
  id: string;
  subtotal: number;
  totalQuantity: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
