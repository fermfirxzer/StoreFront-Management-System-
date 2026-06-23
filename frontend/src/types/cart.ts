export interface CartProduct {
  id: string;
  title: string;
  unitPrice: number;
  image: string | null;
  availableQuantity: number;
}

export interface CartItem {
  id: string;
  product: CartProduct;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  updatedAt: string;
}

export interface AddCartItemPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
