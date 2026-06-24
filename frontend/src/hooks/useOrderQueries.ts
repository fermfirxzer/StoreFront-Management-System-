import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../api/orderApi";
import { getSellerSales } from "../api/orderApi";

export function useOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled,
  });
}

export function useSellerSalesQuery(enabled = true) {
  return useQuery({
    queryKey: ["seller-sales"],
    queryFn: getSellerSales,
    enabled,
  });
}
