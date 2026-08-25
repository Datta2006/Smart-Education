import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "danger" | "success" | "warning" | "info" | "accent";

const VARIANTS: Record<Variant, string> = {
  default: "bg-panel-2 text-muted border border-line",
  secondary: "bg-transparent text-faint",
  outline: "border border-line-2 text-muted",
  danger: "bg-coral/10 text-coral border border-coral/20",
  success: "bg-accent/10 text-accent border border-accent/20",
  warning: "bg-sun/10 text-sun border border-sun/20",
  info: "bg-sky/10 text-sky border border-sky/20",
  accent: "bg-accent text-base-ink",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", rounded = true, children, ...props }, ref) => (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium whitespace-nowrap",
        VARIANTS[variant],
        size === "sm" && "text-[11px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-0.5",
        size === "lg" && "text-sm px-3 py-1",
        rounded ? "rounded-full" : "rounded-lg",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  )
);
Badge.displayName = "Badge";