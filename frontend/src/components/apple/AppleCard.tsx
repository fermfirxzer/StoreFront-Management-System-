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
        "rounded-apple-card bg-white p-6 shadow-apple-card apple-card-border transition-all duration-250 ease-apple",
        interactive ? "hover:-translate-y-0.5 hover:shadow-apple-card-hover" : "",
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
