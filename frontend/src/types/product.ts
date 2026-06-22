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

export interface CreateProductPayload {
  title: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  image?: File;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
