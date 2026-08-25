import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "accent"
  | "gradient";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ink text-base hover:bg-white text-white-ink active:scale-[0.98]",
  accent:
    "bg-accent text-base-ink font-semibold hover:bg-accent-hi shadow-[0_0_24px_-8px_rgb(var(--accent)/0.5)] active:scale-[0.98]",
  secondary:
    "bg-panel-2 text-ink border border-line hover:border-line-2 hover:bg-panel-2/80 active:scale-[0.98]",
  outline:
    "border border-line-2 bg-transparent text-ink hover:border-accent/50 hover:text-accent active:scale-[0.98]",
  ghost: "text-muted hover:text-ink hover:bg-panel-2/60",
  danger: "bg-coral/15 text-coral border border-coral/25 hover:bg-coral/25 active:scale-[0.98]",
  gradient:
    "bg-gradient-to-r from-accent to-sky text-base-ink font-semibold hover:brightness-110 shadow-[0_0_32px_-10px_rgb(var(--accent)/0.55)] active:scale-[0.98]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-all duration-160 ease-out-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
      VARIANTS[variant],
      SIZES[size],
      className
    );
    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }
    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";