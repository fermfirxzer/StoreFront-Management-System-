import { Link } from "react-router-dom";
import productPlaceholder from "../assets/product-placeholder.svg";
import type { Product } from "../types/product";
import AppleButton from "./apple/AppleButton";
import AppleCard from "./apple/AppleCard";

interface ProductCatalogCardProps {
  product: Product;
  detailHref: string;
}

const thaiCurrencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

export default function ProductCatalogCard({
  product,
  detailHref,
}: ProductCatalogCardProps) {
  return (
    <AppleCard
      as="article"
      className="overflow-hidden border border-[#E0E7FF] p-0 shadow-[0_2px_12px_rgba(99,102,241,0.08)]"
      interactive
    >
      <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-violet-500" />

      <Link className="block aspect-video bg-[#EEF2FF]" to={detailHref}>
        <img
          alt={product.image ? product.title : `${product.title} placeholder`}
          className="h-full w-full object-cover"
          src={product.image ?? productPlaceholder}
        />
      </Link>

      <div className="space-y-4 px-4 pb-4 pt-4">
        <div className="space-y-1">
          <Link className="block" to={detailHref}>
            <h2 className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-brand-900">
              {product.title}
            </h2>
          </Link>
          <p className="line-clamp-2 text-[13px] leading-6 text-apple-gray">
            {product.description || "No description added yet."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[17px] font-bold text-[#4338CA]">
            {thaiCurrencyFormatter.format(product.unitPrice)}
          </span>
          <span
            className={
              product.quantity > 0
                ? "inline-flex items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-bold text-[#4338CA]"
                : "inline-flex items-center gap-1.5 rounded-full border border-[#FECACA] bg-[#FEE2E2] px-2.5 py-1 text-[11px] font-bold text-[#991B1B]"
            }
          >
            <span
              className={[
                "inline-block h-1.5 w-1.5 rounded-full",
                product.quantity > 0 ? "bg-[#6366F1]" : "bg-[#FF3B30]",
              ].join(" ")}
            />
            {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-[12px] text-apple-gray">
          <span className="min-w-0 truncate">{product.seller.email}</span>
          <span className="shrink-0">{new Date(product.createdAt).toLocaleDateString("en-GB")}</span>
        </div>

        <AppleButton className="w-full" to={detailHref} variant="secondary">
          View details
        </AppleButton>
      </div>
    </AppleCard>
  );
}
