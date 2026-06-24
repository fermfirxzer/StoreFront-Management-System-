import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getMarketplaceProducts,
  getPaginatedSellerProducts,
  getProductById,
} from "../api/productApi";
import type { ProductFilters, SellerProductFilters } from "../types/product";

export function useProductsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getMarketplaceProducts(filters),
    placeholderData: keepPreviousData,
  });
}

export function useProductDetailQuery(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: productId.length > 0,
  });
}

export function useSellerProductsQuery(filters: SellerProductFilters) {
  return useQuery({
    queryKey: ["seller-products", filters],
    queryFn: () => getPaginatedSellerProducts(filters),
    placeholderData: keepPreviousData,
  });
}
