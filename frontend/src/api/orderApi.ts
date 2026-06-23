import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type { Order } from "../types/order";

interface OrderItemDto {
  id: string;
  product: string;
  product_title: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  created_at: string;
}

interface OrderDto {
  id: string;
  subtotal: string;
  total_quantity: number;
  items: OrderItemDto[];
  created_at: string;
  updated_at: string;
}

function mapOrder(dto: OrderDto): Order {
  return {
    id: dto.id,
    subtotal: Number(dto.subtotal),
    totalQuantity: dto.total_quantity,
    items: dto.items.map((item) => ({
      id: item.id,
      productId: item.product,
      productTitle: item.product_title,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
      createdAt: item.created_at,
    })),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function checkoutCart(): Promise<Order> {
  const response = await apiClient.post<ApiSuccessResponse<OrderDto>>("/orders/checkout/");
  return mapOrder(response.data.data);
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<ApiSuccessResponse<OrderDto[]>>("/orders/");
  return response.data.data.map(mapOrder);
}
