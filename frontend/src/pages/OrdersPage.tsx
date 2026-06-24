import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import AppleCard from "../components/apple/AppleCard";
import { useOrdersQuery } from "../hooks/useOrderQueries";
import { useSellerSalesQuery } from "../hooks/useOrderQueries";
import { useAuthStore } from "../stores/authStore";
import { getApiErrorMessage } from "../utils/apiErrors";

const thaiCurrencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

export default function OrdersPage() {
  const role = useAuthStore((state) => state.role);
  const isBuyer = role === "BUYER";
  const { data: orders, isLoading: isOrdersLoading, error: ordersError } = useOrdersQuery(isBuyer);
  const {
    data: sales,
    isLoading: isSalesLoading,
    error: salesError,
  } = useSellerSalesQuery(role === "SELLER");
  const isLoading = isBuyer ? isOrdersLoading : isSalesLoading;
  const error = isBuyer ? ordersError : salesError;

  return (
    <section className="space-y-6">
      <AppleCard className="border-t-4 border-t-brand-500">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
          {isBuyer ? "Buyer area" : "Seller area"}
        </p>
        <h1 className="mt-3 text-[32px] font-bold tracking-[-0.04em] text-brand-900 sm:text-[40px]">
          {isBuyer ? "Purchase history" : "Sales history"}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-apple-gray">
          {isBuyer
            ? "Review your completed purchases and the items captured at checkout time."
            : "Track which products have sold, who bought them, and the totals captured at checkout."}
        </p>
      </AppleCard>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <AppleCard key={index} className="space-y-4">
              <div className="h-6 w-40 rounded-full apple-skeleton animate-shimmer" />
              <div className="h-20 rounded-apple-input apple-skeleton animate-shimmer" />
            </AppleCard>
          ))}
        </div>
      ) : null}

      {error ? (
        <AppleCard className="border border-apple-red/20 bg-[#fff5f5] text-apple-red">
          <p className="text-[13px] leading-6 animate-shake">
            {getApiErrorMessage(
              error,
              isBuyer ? "We could not load your order history." : "We could not load your sales history."
            )}
          </p>
        </AppleCard>
      ) : null}

      {!isLoading && !error && isBuyer && orders ? (
        orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <AppleCard key={order.id} className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
                      Order
                    </p>
                    <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-brand-900">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </h2>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[13px] text-apple-gray">{order.totalQuantity} items</p>
                    <p className="mt-1 text-[18px] font-semibold text-brand-900">
                      {thaiCurrencyFormatter.format(order.subtotal)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-apple-card bg-[#F8FAFF] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[15px] font-semibold text-brand-900">
                          {item.productTitle}
                        </p>
                        <p className="mt-1 text-[13px] text-apple-gray">
                          {item.quantity} x {thaiCurrencyFormatter.format(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-[15px] font-semibold text-[#4338CA]">
                        {thaiCurrencyFormatter.format(item.lineTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </AppleCard>
            ))}
          </div>
        ) : (
          <AppleCard className="grid place-items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 shadow-sm">
              <Package className="h-8 w-8 text-brand-600" />
            </div>
            <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-brand-900">
              No orders yet
            </h2>
            <p className="mt-3 max-w-md text-[17px] leading-7 text-apple-gray">
              When you complete checkout, your order history will appear here.
            </p>
            <div className="mt-8">
              <Link
                className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-500 to-violet-500 px-5 py-2.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:from-brand-600 hover:to-violet-600"
                to="/products"
              >
                Browse products
              </Link>
            </div>
          </AppleCard>
        )
      ) : null}

      {!isLoading && !error && !isBuyer && sales ? (
        sales.length > 0 ? (
          <div className="space-y-4">
            {sales.map((sale) => (
              <AppleCard key={sale.id} className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
                      Sold item
                    </p>
                    <h2 className="mt-2 line-clamp-1 text-[22px] font-semibold tracking-[-0.02em] text-brand-900">
                      {sale.productTitle}
                    </h2>
                    <p className="mt-1 text-[13px] text-apple-gray">
                      Buyer: {sale.buyer.email}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[13px] text-apple-gray">
                      {new Date(sale.soldAt).toLocaleDateString("en-GB")}
                    </p>
                    <p className="mt-1 text-[18px] font-semibold text-brand-900">
                      {thaiCurrencyFormatter.format(sale.lineTotal)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-apple-card bg-[#F8FAFF] p-4">
                    <p className="text-[12px] uppercase tracking-[0.16em] text-apple-gray">
                      Quantity
                    </p>
                    <p className="mt-2 text-[18px] font-semibold text-brand-900">{sale.quantity}</p>
                  </div>
                  <div className="rounded-apple-card bg-[#F8FAFF] p-4">
                    <p className="text-[12px] uppercase tracking-[0.16em] text-apple-gray">
                      Unit price
                    </p>
                    <p className="mt-2 text-[18px] font-semibold text-brand-900">
                      {thaiCurrencyFormatter.format(sale.unitPrice)}
                    </p>
                  </div>
                  <div className="rounded-apple-card bg-[#F8FAFF] p-4">
                    <p className="text-[12px] uppercase tracking-[0.16em] text-apple-gray">
                      Order ID
                    </p>
                    <p className="mt-2 line-clamp-1 text-[14px] font-semibold text-brand-900">
                      {sale.orderId}
                    </p>
                  </div>
                </div>
              </AppleCard>
            ))}
          </div>
        ) : (
          <AppleCard className="grid place-items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 shadow-sm">
              <Package className="h-8 w-8 text-brand-600" />
            </div>
            <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-brand-900">
              No sales yet
            </h2>
            <p className="mt-3 max-w-md text-[17px] leading-7 text-apple-gray">
              When buyers purchase your products, sold items will appear here.
            </p>
            <div className="mt-8">
              <Link
                className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-500 to-violet-500 px-5 py-2.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:from-brand-600 hover:to-violet-600"
                to="/seller/products/create"
              >
                Add product
              </Link>
            </div>
          </AppleCard>
        )
      ) : null}
    </section>
  );
}
