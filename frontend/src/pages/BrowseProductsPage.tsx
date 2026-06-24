import { useMemo } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import AppleCard from "../components/apple/AppleCard";
import AppleInput from "../components/apple/AppleInput";
import PaginationControls from "../components/PaginationControls";
import ProductCatalogCard from "../components/ProductCatalogCard";
import { useProductsQuery } from "../hooks/useProductQueries";
import type { ProductFilters } from "../types/product";
import { getApiErrorMessage } from "../utils/apiErrors";

const defaultPageSize = 12;

function parsePageParam(value: string | null): number {
  const parsedValue = Number(value ?? "1");
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function parseTextParam(value: string | null): string | undefined {
  if (value === null || value.trim() === "") {
    return undefined;
  }
  return value;
}

function normalizePriceFilterValue(value: string): string {
  if (value.trim() === "") {
    return "";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return String(Math.max(0, numericValue));
}

function parseSortParam(
  value: string | null
): ProductFilters["sortBy"] {
  if (
    value === "updated-desc" ||
    value === "price-desc" ||
    value === "price-asc" ||
    value === "quantity-desc" ||
    value === "quantity-asc"
  ) {
    return value;
  }
  return "updated-desc";
}

export default function BrowseProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ProductFilters>(
    () => ({
      page: parsePageParam(searchParams.get("page")),
      pageSize: defaultPageSize,
      search: parseTextParam(searchParams.get("search")),
      minPrice: parseTextParam(searchParams.get("min_price")),
      maxPrice: parseTextParam(searchParams.get("max_price")),
      sortBy: parseSortParam(searchParams.get("sort")),
    }),
    [searchParams]
  );

  const { data, isLoading, isFetching, error } = useProductsQuery(filters);

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / defaultPageSize));

  const updateFilters = (nextValues: Partial<ProductFilters>) => {
    const nextParams = new URLSearchParams(searchParams);

    const nextPage = nextValues.page ?? 1;
    nextParams.set("page", String(nextPage));

    const textFields: Array<keyof Pick<ProductFilters, "search" | "minPrice" | "maxPrice">> = [
      "search",
      "minPrice",
      "maxPrice",
    ];

    for (const field of textFields) {
      const paramName =
        field === "minPrice" ? "min_price" : field === "maxPrice" ? "max_price" : field;
      const value = nextValues[field];

      if (value === undefined) {
        continue;
      }
      if (value.trim() === "") {
        nextParams.delete(paramName);
      } else {
        nextParams.set(paramName, value);
      }
    }

    if (nextValues.sortBy !== undefined) {
      if (nextValues.sortBy === "updated-desc") {
        nextParams.delete("sort");
      } else {
        nextParams.set("sort", nextValues.sortBy);
      }
    }

    setSearchParams(nextParams);
  };

  return (
    <section className="animate-fade-in space-y-8">
      <AppleCard className="border-t-4 border-t-brand-500 p-6 shadow-[0_20px_60px_rgba(99,102,241,0.12)] sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
          Buyer area
        </p>
        <h1 className="mt-3 text-[32px] font-bold tracking-[-0.04em] text-brand-900 sm:text-[40px]">
          Browse products
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-apple-gray">
          Search the marketplace, compare prices, and open any product for a closer look.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.6fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-[42px] h-4 w-4 text-[#A5B4FC]" />
            <AppleInput
              containerClassName="h-full"
              fieldClassName="pl-11"
              hint="Searches product titles"
              label="Search"
              onChange={(event) => {
                updateFilters({ search: event.target.value, page: 1 });
              }}
              placeholder="Desk lamp"
              value={filters.search ?? ""}
            />
          </div>

          <AppleInput
            hint="Thai baht"
            inputMode="decimal"
            label="Min price"
            min={0}
            onChange={(event) => {
              updateFilters({ minPrice: normalizePriceFilterValue(event.target.value), page: 1 });
            }}
            placeholder="100"
            prefix="THB"
            type="number"
            value={filters.minPrice ?? ""}
          />

          <AppleInput
            hint="Thai baht"
            inputMode="decimal"
            label="Max price"
            min={0}
            onChange={(event) => {
              updateFilters({ maxPrice: normalizePriceFilterValue(event.target.value), page: 1 });
            }}
            placeholder="1000"
            prefix="THB"
            type="number"
            value={filters.maxPrice ?? ""}
          />

          <label className="block">
            <span className="mb-2 block text-[13px] font-medium uppercase tracking-[0.2px] text-apple-black">
              Sort
            </span>
            <select
              className="w-full cursor-pointer rounded-apple-input border border-brand-200 bg-surface-input px-4 py-3 text-[17px] text-apple-black outline-none transition-all duration-150 ease-apple focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
              onChange={(event) => {
                updateFilters({
                  sortBy: event.target.value as ProductFilters["sortBy"],
                  page: 1,
                });
              }}
              value={filters.sortBy ?? "updated-desc"}
            >
              <option value="updated-desc">Latest update</option>
              <option value="quantity-desc">Quantity: high to low</option>
              <option value="quantity-asc">Quantity: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="price-asc">Price: low to high</option>
            </select>
            <p className="mt-2 text-[12px] text-apple-gray">Choose how products are ordered</p>
          </label>
        </div>
      </AppleCard>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <AppleCard key={index} className="space-y-4 overflow-hidden p-0" interactive>
              <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-violet-500" />
              <div className="space-y-4 px-4 pb-4 pt-4">
                <div className="aspect-video rounded-apple-input apple-skeleton animate-shimmer" />
                <div className="h-5 w-3/4 rounded-full apple-skeleton animate-shimmer" />
                <div className="h-4 w-full rounded-full apple-skeleton animate-shimmer" />
                <div className="h-11 rounded-apple-pill apple-skeleton animate-shimmer" />
              </div>
            </AppleCard>
          ))}
        </div>
      ) : null}

      {error ? (
        <AppleCard className="border border-apple-red/20 bg-[#fff5f5] text-apple-red">
          <p className="text-[13px] leading-6 animate-shake">
            {getApiErrorMessage(error, "We could not load marketplace products.")}
          </p>
        </AppleCard>
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-apple-gray">
              {data.count} product{data.count === 1 ? "" : "s"} found
            </p>
            {isFetching ? (
              <span className="text-[13px] font-medium uppercase tracking-[0.2px] text-brand-600">
                Updating results...
              </span>
            ) : null}
          </div>

          {data.results.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {data.results.map((product) => (
                  <ProductCatalogCard
                    key={product.id}
                    detailHref={`/products/${product.id}?${searchParams.toString()}`}
                    product={product}
                  />
                ))}
              </div>

              <PaginationControls
                currentPage={filters.page}
                isPending={isFetching}
                onPageChange={(page) => {
                  updateFilters({ page });
                }}
                totalPages={totalPages}
              />
            </>
          ) : (
            <AppleCard className="grid place-items-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 shadow-sm">
                <Search aria-hidden="true" className="h-7 w-7 text-brand-600" />
              </div>
              <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-brand-900">
                No products match these filters
              </h2>
              <p className="mt-3 max-w-md text-[17px] leading-7 text-apple-gray">
                Try changing the search text, price range, or sort option.
              </p>
            </AppleCard>
          )}
        </>
      ) : null}
    </section>
  );
}
