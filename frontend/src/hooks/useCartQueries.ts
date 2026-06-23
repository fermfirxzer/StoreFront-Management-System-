import { useQuery } from "@tanstack/react-query";
import { getCart } from "../api/cartApi";

export function useCartQuery(enabled = true) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled,
  });
}
