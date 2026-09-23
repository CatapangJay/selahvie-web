"use client";

import { WeddingTemplate } from "@/types/template";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";

interface Props {
  template: WeddingTemplate;
  index?: number;
}

export default function TemplateCard({ template, index = 0 }: Props) {
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(template.id);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden"
      style={{
        background: "var(--color-surface-container)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-outline)",
      }}
    >
      {/* Preview Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
        {/* Full-image click → template details */}
        <Link
          href={`/templates/${template.id}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${template.name} details`}
        >
          <Image
            src={template.previewImage}
            alt={template.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Hover overlay — live preview affordance (sits above the image link) */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-end justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "linear-gradient(to top, rgba(14,13,11,0.7) 0%, transparent 50%)" }}
        >
          <Link
            href={`/preview/${template.id}`}
            className="pointer-events-auto flex min-h-[36px] items-center gap-1.5 label-luxury"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-surface)",
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <Eye size={12} />
            Live preview
          </Link>
        </div>

        {/* Featured badge */}
        {template.isFeatured && (
          <div
            className="absolute top-3 left-3 z-20 label-luxury px-2.5 py-1"
            style={{
              background: "var(--color-surface-container-highest)",
              color: "var(--color-primary)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-outline-variant)",
            }}
          >
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5">
        {/* Tags */}
        <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>
          {template.tags.join(" · ")}
        </p>

        <p
          className="headline-sm"
          style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 300 }}
        >
          {template.name}
        </p>
        <p
          className="mt-2 text-xs font-light leading-relaxed flex-1"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {template.description}
        </p>

        {/* Price + CTA — pinned bottom */}
        <div
          className="mt-5 flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid var(--color-outline)" }}
        >
          <p
            className="font-serif"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 300, color: "var(--color-primary)" }}
          >
            {formatPrice(template.price)}
          </p>
          <ButtonPrimary
            size="sm"
            onClick={() => addItem(template)}
            disabled={inCart}
          >
            <ShoppingBag size={12} />
            {inCart ? "In cart" : "Add to cart"}
          </ButtonPrimary>
        </div>
      </div>
    </motion.div>
  );
}
