import type { HTMLAttributes, ReactNode } from "react";

type AppleCardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section";
  children: ReactNode;
  interactive?: boolean;
};

export default function AppleCard({
  as = "div",
  children,
  interactive = false,
  className = "",
  ...props
}: AppleCardProps) {
  const Component = as;

  return (
    <Component
      className={[
        "rounded-apple-card bg-surface-card p-6 shadow-[0_2px_12px_rgba(99,102,241,0.08)] apple-card-border transition-all duration-[250ms] ease-apple",
        interactive ? "hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(99,102,241,0.16)]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
