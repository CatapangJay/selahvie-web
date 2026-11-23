"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function ButtonPrimary({
  children,
  size = "md",
  fullWidth,
  className,
  ...props
}: Props) {
  const sizes = {
    sm: "px-3.5 py-2 text-[0.8125rem] gap-1.5 min-h-[36px]",
    md: "px-4 py-2.5 text-sm gap-2 min-h-[44px]",
    lg: "px-6 py-3 text-[0.9375rem] gap-2 min-h-[48px]",
  };

  return (
    <button
      className={cn(
        "btn-primary inline-flex items-center justify-center cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      style={{ borderRadius: "var(--radius-sm)" }}
      {...props}
    >
      {children}
    </button>
  );
}
