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
        "label-luxury inline-flex items-center gap-1.5 transition-colors duration-200 cursor-pointer",
        "border-b pb-0.5 disabled:opacity-40",
        className
      )}
      style={{
        color: "var(--color-on-surface-variant)",
        borderColor: "var(--color-outline)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-primary)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-primary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-on-surface-variant)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-outline)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}
