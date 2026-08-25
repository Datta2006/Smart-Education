import * as React from "react";
import { cn } from "@/lib/utils";

export type TitleSize = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: TitleSize;
  size?: TitleSize;
}

export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ as: Tag = "h2", size, className, ...props }, ref) => (
    <Tag
      className={cn(
        "font-display font-semibold tracking-tight text-ink",
        size === "h1" && "text-3xl sm:text-5xl",
        size === "h2" && "text-2xl sm:text-3xl",
        size === "h3" && "text-xl sm:text-2xl",
        size === "h4" && "text-lg sm:text-xl",
        size === "h5" && "text-base sm:text-lg",
        size === "h6" && "text-sm sm:text-base",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Title.displayName = "Title";

export interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, ...props }, ref) => (
    <p
      className={cn("text-base text-muted leading-relaxed", className)}
      ref={ref}
      {...props}
    />
  )
);
Body.displayName = "Body";

export interface CaptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export const Caption = React.forwardRef<HTMLParagraphElement, CaptionProps>(
  ({ className, ...props }, ref) => (
    <p className={cn("text-sm text-faint leading-relaxed", className)} ref={ref} {...props} />
  )
);
Caption.displayName = "Caption";

export interface LabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      className={cn(
        "text-[11px] font-medium text-faint uppercase tracking-[0.14em]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Label.displayName = "Label";

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, ...props }, ref) => (
    <code
      className={cn(
        "text-sm font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded-md border border-accent/15",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Code.displayName = "Code";

export const Typography = { Title, Body, Caption, Label, Code };