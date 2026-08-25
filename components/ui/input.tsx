import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefixIcon, suffixIcon, id, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className={cn("w-full space-y-1.5", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-faint">
              {prefixIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-10 w-full rounded-xl border border-line bg-panel-2/60 px-4 text-sm text-ink placeholder:text-faint",
              "transition-all duration-160 ease-out-strong",
              "focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15",
              "disabled:cursor-not-allowed disabled:opacity-40",
              prefixIcon && "pl-9",
              suffixIcon && "pr-9",
              error && "border-coral/60 focus:border-coral/60 focus:ring-coral/15"
            )}
            {...rest}
          />
          {suffixIcon && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-faint">
              {suffixIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-coral">{error}</p>}
        {hint && !error && <p className="text-xs text-faint">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";