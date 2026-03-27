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
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={cn(
        "btn-gradient inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white transition-all duration-200",
        "cursor-pointer hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
