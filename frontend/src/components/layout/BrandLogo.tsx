import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  to?: string;
}

export default function BrandLogo({ className = "", compact = false, to = "/" }: BrandLogoProps) {
  const content = (
    <>
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
        <ShoppingBag className="h-4 w-4 text-white" />
      </div>
      <span className={["font-bold tracking-tight text-white", compact ? "text-[16px]" : "text-[18px]"].join(" ")}>
        StoreFront Management System
      </span>
    </>
  );

  if (to) {
    return (
      <Link className={["flex items-center gap-2", className].filter(Boolean).join(" ")} to={to}>
        {content}
      </Link>
    );
  }

  return <div className={["flex items-center gap-2", className].filter(Boolean).join(" ")}>{content}</div>;
}
