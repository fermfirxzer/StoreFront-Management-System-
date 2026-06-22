import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

type CommonProps = {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
  loading?: boolean;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never;
  };

type LinkProps = CommonProps & {
  to: string;
  type?: never;
  disabled?: boolean;
  onClick?: never;
};

function getVariantClasses(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "bg-apple-gray-light text-apple-black hover:bg-[#e8e8ed]";
    case "ghost":
      return "border border-apple-border bg-transparent text-apple-black hover:bg-apple-gray-light";
    case "destructive":
      return "border border-apple-red bg-transparent text-apple-red hover:bg-apple-red hover:text-white";
    case "primary":
    default:
      return "bg-apple-blue text-white hover:bg-apple-blue-hover";
  }
}

function baseClasses({ fullWidth, loading, variant }: { fullWidth?: boolean; loading?: boolean; variant: Variant }) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-apple-pill px-6 py-3 text-[17px] font-medium tracking-[-0.01em] transition-all duration-200 ease-apple active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
    getVariantClasses(variant),
    fullWidth ? "w-full" : "",
    loading ? "cursor-progress" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function AppleButton(props: ButtonProps | LinkProps) {
  const {
    variant = "primary",
    children,
    fullWidth,
    className = "",
    loading = false,
  } = props;
  const classes = [baseClasses({ variant, fullWidth, loading }), className]
    .filter(Boolean)
    .join(" ");

  if ("to" in props && typeof props.to === "string") {
    const { to, disabled } = props;
    return (
      <Link
        aria-disabled={disabled || loading}
        className={[
          classes,
          disabled || loading ? "pointer-events-none" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        to={to}
      >
        {loading ? "Loading..." : children}
      </Link>
    );
  }

  const { type = "button", disabled, ...buttonProps } = props;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...buttonProps}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
