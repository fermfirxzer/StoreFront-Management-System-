import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const buyerLinks = [
  { label: "Browse Products", to: "/products" },
  { label: "My Cart", to: "/cart" },
  { label: "Purchase History", to: "/history" },
];

const sellerLinks = [
  { label: "Seller Dashboard", to: "/seller/dashboard" },
  { label: "Sales History", to: "/history" },
  { label: "Add Product", to: "/seller/products/create" },
  { label: "Register as Seller", to: "/register" },
];

interface FooterProps {
  containerClass: string;
}

export default function Footer({ containerClass }: FooterProps) {
  return (
    <footer className="mt-20 bg-[#1E1B4B] text-white">
      <div className="h-1 w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" />

      <div className={`${containerClass} py-14`}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <BrandLogo compact />
            </div>
            <p className="max-w-sm text-[14px] leading-relaxed text-white/50">
              A simple platform for sellers and buyers to connect and transact with ease.
            </p>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#818CF8]">
              For Buyers
            </p>
            <ul className="space-y-2.5">
              {buyerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    className="text-[14px] text-white/60 transition-colors duration-150 hover:text-white"
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#818CF8]">
              For Sellers
            </p>
            <ul className="space-y-2.5">
              {sellerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    className="text-[14px] text-white/60 transition-colors duration-150 hover:text-white"
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-white/40">
            © 2026 StoreFront-Management-System. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#34C759]" />
            <span className="text-[12px] text-white/40">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
