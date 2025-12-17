import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import type { ButtonSize, ButtonVariant } from "@/components/ui/Button";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-110 focus-visible:ring-primary/40",
  secondary:
    "bg-surface-2 text-foreground border border-border hover:bg-surface focus-visible:ring-border/40",
  ghost: "bg-transparent text-foreground hover:bg-surface-2 focus-visible:ring-border/40",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}


