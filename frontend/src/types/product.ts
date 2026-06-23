export interface ProductSeller {
  id: number;
  email: string;
}

export interface Product {
  id: string;
  seller: ProductSeller;
  title: string;
  description: string;
  unitPrice: number;
  quantity: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page: number;
  pageSize?: number;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean | null;
}

export interface SellerProductFilters {
  page: number;
  pageSize?: number;
  search?: string;
}

export interface CreateProductPayload {
  title: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  image?: File;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
