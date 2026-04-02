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
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-xs gap-2",
    lg: "px-7 py-3 text-xs gap-2",
  };

  return (
    <button
      className={cn(
        "btn-primary inline-flex items-center justify-center cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "label-luxury",
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
