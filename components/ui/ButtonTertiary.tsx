"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function ButtonTertiary({ children, className, ...props }: Props) {
  return (
    <button
      className={cn(
        "label-luxury inline-flex items-center gap-1 text-[var(--color-on-surface)] transition-colors duration-200",
        "border-b-2 pb-0.5 hover:text-[var(--color-primary)] disabled:opacity-50",
        className
      )}
      style={{ borderColor: "var(--color-tertiary-fixed-dim)" }}
      {...props}
    >
      {children}
    </button>
  );
}
