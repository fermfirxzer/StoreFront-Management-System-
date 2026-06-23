import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLinkProps {
  to: string;
  children: ReactNode;
  end?: boolean;
  onClick?: () => void;
}

function isActivePath(pathname: string, to: string, end = false) {
  const normalizedTo = to === "/" ? "/" : to.replace(/\/+$/, "");

  if (normalizedTo === "/") {
    return pathname === "/";
  }

  if (end) {
    return pathname === normalizedTo;
  }

  return pathname === normalizedTo || pathname.startsWith(`${normalizedTo}/`);
}

export default function NavLink({ to, children, end = false, onClick }: NavLinkProps) {
  const { pathname } = useLocation();
  const active = isActivePath(pathname, to, end);

  return (
    <Link
      className={[
        "inline-flex items-center rounded-full px-4 py-1.5 text-[14px] font-medium transition-all duration-150",
        active
          ? "bg-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
          : "text-white/80 hover:bg-white/15 hover:text-white",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      to={to}
    >
      {children}
    </Link>
  );
}

