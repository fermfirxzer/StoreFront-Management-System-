import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from "../types/product";

interface ProductResponseDto {
  id: string;
  seller: {
    id: number;
    email: string;
  };
  title: string;
  description: string;
  unit_price: string;
  quantity: number;
  image: string | null;
  created_at: string;
  updated_at: string;
}

function mapProduct(dto: ProductResponseDto): Product {
  return {
    id: dto.id,
    seller: dto.seller,
    title: dto.title,
    description: dto.description,
    unitPrice: Number(dto.unit_price),
    quantity: dto.quantity,
    image: dto.image,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function buildProductFormData(payload: CreateProductPayload | UpdateProductPayload): FormData {
  const formData = new FormData();

  if (payload.title !== undefined) {
    formData.append("title", payload.title);
  }
  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }
  if (payload.unitPrice !== undefined) {
    formData.append("unit_price", payload.unitPrice.toString());
  }
  if (payload.quantity !== undefined) {
    formData.append("quantity", payload.quantity.toString());
  }
  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return formData;
}

export async function getSellerProducts(): Promise<Product[]> {
  const response = await apiClient.get<ApiSuccessResponse<ProductResponseDto[]>>("/products/");
  return response.data.data.map(mapProduct);
}

export async function getSellerProductById(productId: string): Promise<Product> {
  const response = await apiClient.get<ApiSuccessResponse<ProductResponseDto>>(
    `/products/${productId}/`
  );
  return mapProduct(response.data.data);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const response = await apiClient.post<ApiSuccessResponse<ProductResponseDto>>(
    "/products/",
    buildProductFormData(payload)
  );
  return mapProduct(response.data.data);
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<Product> {
  const response = await apiClient.patch<ApiSuccessResponse<ProductResponseDto>>(
    `/products/${id}/`,
    buildProductFormData(payload)
  );
  return mapProduct(response.data.data);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}/`);
}
