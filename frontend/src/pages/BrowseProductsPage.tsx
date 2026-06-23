import { Link } from "react-router-dom";
import AppleCard from "../components/apple/AppleCard";

export default function BrowseProductsPage() {
  return (
    <section className="space-y-6">
      <AppleCard className="border-t-4 border-t-brand-500">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
          Buyer area
        </p>
        <h1 className="mt-3 text-[32px] font-bold tracking-[-0.04em] text-brand-900 sm:text-[40px]">
          Browse products
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-apple-gray">
          This route is ready for the marketplace catalog. You can hook a product grid into it
          without changing the navbar or footer shell.
        </p>
        <div className="mt-6">
          <Link
            className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-500 to-violet-500 px-5 py-2.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:from-brand-600 hover:to-violet-600"
            to="/"
          >
            Back to home
          </Link>
        </div>
      </AppleCard>
    </section>
  );
}

