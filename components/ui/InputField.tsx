"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function InputField({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-[0.8125rem] font-medium"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-0 py-2.5",
          "bg-transparent border-0 border-b outline-none",
          "text-sm",
          "transition-colors duration-200",
          "placeholder:text-[var(--color-on-surface-muted)]",
          // `!` beats the global `* { border-color: transparent }` reset.
          error
            ? "border-[var(--color-error)]! focus:border-[var(--color-error)]!"
            : "border-[var(--color-outline)]! hover:border-[var(--color-on-surface-muted)]! focus:border-[var(--color-primary)]!",
          className
        )}
        style={{ color: "var(--color-on-surface)" }}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextareaField({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-[0.8125rem] font-medium"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={cn(
          "w-full bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm leading-relaxed",
          "border outline-none resize-y",
          "text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-muted)]",
          "transition-colors duration-200",
          error
            ? "border-[var(--color-error)]! focus:border-[var(--color-error)]!"
            : "border-[var(--color-outline)]! hover:border-[var(--color-on-surface-muted)]! focus:border-[var(--color-primary)]!",
          className
        )}
        style={{ borderRadius: "var(--radius-sm)" }}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
      )}
    </div>
  );
}
