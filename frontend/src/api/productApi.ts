import { apiClient } from "./client";
import type { ApiSuccessResponse, PaginatedResponse } from "../types/api";
import type {
  CreateProductPayload,
  Product,
  ProductFilters,
  SellerProductFilters,
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
  if (payload.removeImage) {
    formData.append("remove_image", "true");
  }

  return formData;
}

function buildProductQueryParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", filters.page.toString());

  if (filters.pageSize !== undefined) {
    params.set("page_size", filters.pageSize.toString());
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.minPrice) {
    params.set("min_price", filters.minPrice);
  }
  if (filters.maxPrice) {
    params.set("max_price", filters.maxPrice);
  }
  if (filters.sortBy) {
    params.set("sort", filters.sortBy);
  }

  return params;
}

export async function getMarketplaceProducts(
  filters: ProductFilters
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<ProductResponseDto>>>(
    `/products/?${buildProductQueryParams(filters).toString()}`
  );

  return {
    ...response.data.data,
    results: response.data.data.results.map(mapProduct),
  };
}

function buildSellerProductQueryParams(filters: SellerProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", filters.page.toString());

  if (filters.pageSize !== undefined) {
    params.set("page_size", filters.pageSize.toString());
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.sortBy) {
    params.set("sort", filters.sortBy);
  }

  return params;
}

export async function getPaginatedSellerProducts(
  filters: SellerProductFilters
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<ProductResponseDto>>>(
    `/products/seller/?${buildSellerProductQueryParams(filters).toString()}`
  );

  return {
    ...response.data.data,
    results: response.data.data.results.map(mapProduct),
  };
}

export async function getProductById(productId: string): Promise<Product> {
  const response = await apiClient.get<ApiSuccessResponse<ProductResponseDto>>(
    `/products/${productId}/`
  );
  return mapProduct(response.data.data);
}

export async function getSellerProductById(productId: string): Promise<Product> {
  return getProductById(productId);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const response = await apiClient.post<ApiSuccessResponse<ProductResponseDto>>(
    "/products/seller/",
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
