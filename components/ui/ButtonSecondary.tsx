"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function ButtonSecondary({
  children,
  size = "md",
  fullWidth,
  className,
  ...props
}: Props) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200",
        "border bg-transparent hover:bg-[var(--color-surface-container-low)] active:scale-95",
        "text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      style={{ borderColor: "rgba(120, 107, 97, 0.3)" }}
      {...props}
    >
      {children}
    </button>
  );
}
