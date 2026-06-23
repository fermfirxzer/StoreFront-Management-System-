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

export interface SaleBuyer {
  id: number;
  email: string;
}

export interface SellerSale {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  soldAt: string;
  buyer: SaleBuyer;
}
