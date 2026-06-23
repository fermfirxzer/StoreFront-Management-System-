import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../api/orderApi";

export function useOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled,
  });
}
