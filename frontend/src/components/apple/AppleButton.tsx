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
      return "bg-[#EEF2FF] text-[#4338CA] hover:bg-[#E0E7FF]";
    case "ghost":
      return "text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1E1B4B]";
    case "destructive":
      return "border-2 border-[#FF3B30] bg-[#FF3B30] text-white shadow-[0_8px_20px_rgba(255,59,48,0.18)] hover:border-[#E22E23] hover:bg-[#E22E23] hover:shadow-[0_10px_24px_rgba(255,59,48,0.28)]";
    case "primary":
    default:
      return "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:from-[#4F46E5] hover:to-[#7C3AED]";
  }
}

function baseClasses({ fullWidth, loading, variant }: { fullWidth?: boolean; loading?: boolean; variant: Variant }) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-apple-pill px-6 py-3 text-[15px] font-semibold tracking-[-0.01em] outline-none transition-all duration-200 ease-apple active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card disabled:pointer-events-none disabled:opacity-60",
    getVariantClasses(variant),
    variant === "primary" ? "shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] hover:scale-[1.02]" : "",
    fullWidth ? "w-full" : "",
    loading ? "cursor-progress" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function getButtonDomProps(props: ButtonProps) {
  const domProps = { ...props };
  delete domProps.variant;
  delete domProps.children;
  delete domProps.fullWidth;
  delete domProps.className;
  delete domProps.loading;
  return domProps;
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

  const { type = "button", disabled, ...buttonProps } = getButtonDomProps(props);
  return (
    <button
      type={type}
      disabled={disabled || loading}
      {...buttonProps}
      className={classes}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
