import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type {
  AddCartItemPayload,
  Cart,
  UpdateCartItemPayload,
} from "../types/cart";

interface CartProductDto {
  id: string;
  title: string;
  unit_price: string;
  image: string | null;
  quantity: number;
}

interface CartItemDto {
  id: string;
  product: CartProductDto;
  quantity: number;
  line_total: string;
}

interface CartDto {
  id: string;
  items: CartItemDto[];
  total_quantity: number;
  subtotal: string;
  updated_at: string;
}

function mapCart(dto: CartDto): Cart {
  return {
    id: dto.id,
    items: dto.items.map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        title: item.product.title,
        unitPrice: Number(item.product.unit_price),
        image: item.product.image,
        availableQuantity: item.product.quantity,
      },
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
    })),
    totalQuantity: dto.total_quantity,
    subtotal: Number(dto.subtotal),
    updatedAt: dto.updated_at,
  };
}

export async function getCart(): Promise<Cart> {
  const response = await apiClient.get<ApiSuccessResponse<CartDto>>("/cart/");
  return mapCart(response.data.data);
}

export async function addCartItem(payload: AddCartItemPayload): Promise<Cart> {
  const response = await apiClient.post<ApiSuccessResponse<CartDto>>("/cart/items/", {
    product_id: payload.productId,
    quantity: payload.quantity,
  });
  return mapCart(response.data.data);
}

export async function updateCartItemQuantity(
  itemId: string,
  payload: UpdateCartItemPayload
): Promise<Cart> {
  const response = await apiClient.patch<ApiSuccessResponse<CartDto>>(`/cart/items/${itemId}/`, payload);
  return mapCart(response.data.data);
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await apiClient.delete<ApiSuccessResponse<CartDto>>(`/cart/items/${itemId}/`);
  return mapCart(response.data.data);
}
