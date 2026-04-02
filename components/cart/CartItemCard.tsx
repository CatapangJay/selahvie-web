"use client";

import { CartItem } from "@/types/cart";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";

export default function CartItemCard({ item }: { item: CartItem }) {
  const { removeItem } = useCartStore();

  return (
    <div
      className="flex gap-4"
      style={{
        background: "var(--color-surface-container)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--color-outline)",
        padding: "0.875rem",
      }}
    >
      {/* Preview thumbnail */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ width: 72, height: 56, borderRadius: "var(--radius-sm)" }}
      >
        <Image
          src={item.template.previewImage}
          alt={item.template.name}
          fill
          className="object-cover"
          sizes="72px"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--color-on-surface)" }}
          >
            {item.template.name}
          </p>
          <p className="label-luxury mt-1" style={{ color: "var(--color-on-surface-muted)" }}>
            {item.template.tags.slice(0, 2).join(" · ")}
          </p>
        </div>
        <p
          className="font-serif text-sm"
          style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 300, color: "var(--color-primary)" }}
        >
          {formatPrice(item.template.price)}
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.templateId)}
        className="self-start transition-opacity hover:opacity-60"
        style={{ color: "var(--color-on-surface-muted)" }}
        aria-label="Remove item"
      >
        <X size={14} strokeWidth={1.25} />
      </button>
    </div>
  );
}
