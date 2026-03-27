"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function InputField({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="label-luxury text-[var(--color-on-surface-variant)]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full bg-[var(--color-surface-container-low)] rounded-sm px-0 py-2",
          "border-0 border-b-2 border-[var(--color-outline-variant)] outline-none",
          "text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]",
          "transition-all duration-200",
          "focus:bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-tertiary)]",
          error && "border-[var(--color-error)]",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextareaField({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="label-luxury text-[var(--color-on-surface-variant)]">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={cn(
          "w-full bg-[var(--color-surface-container-low)] rounded-sm px-3 py-2",
          "border border-[var(--color-outline-variant)] outline-none resize-none",
          "text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]",
          "transition-all duration-200",
          "focus:bg-[var(--color-surface-container-lowest)] focus:border-[var(--color-tertiary)]",
          error && "border-[var(--color-error)]",
          className
        )}
        style={{ borderRadius: "var(--radius-sm)" }}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
