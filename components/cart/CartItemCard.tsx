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
      className="flex gap-4 rounded-xl p-3 transition-colors"
      style={{ background: "var(--color-surface-container-low)" }}
    >
      {/* Preview thumbnail */}
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={item.template.previewImage}
          alt={item.template.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="title-md text-[var(--color-on-surface)] text-sm">{item.template.name}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {item.template.tags.map((tag) => (
              <span key={tag} className="label-luxury text-[10px] text-[var(--color-on-surface-variant)]">{tag}</span>
            ))}
          </div>
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--color-tertiary)" }}>
          {formatPrice(item.template.price)}
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.templateId)}
        className="self-start text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors"
        aria-label="Remove item"
      >
        <X size={16} />
      </button>
    </div>
  );
}
