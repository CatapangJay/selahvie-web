"use client";

import { WeddingTemplate } from "@/types/template";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";

interface Props {
  template: WeddingTemplate;
  index?: number;
}

export default function TemplateCard({ template, index = 0 }: Props) {
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(template.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl"
      style={{ background: "var(--color-surface-container-low)" }}
    >
      {/* Preview Image */}
      <Link href={`/templates/${template.id}`} className="block relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
        <Image
          src={template.previewImage}
          alt={template.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--color-on-surface)] backdrop-blur cursor-pointer">
            <Eye size={16} />
            View Details
          </span>
        </div>

        {/* Featured badge */}
        {template.isFeatured && (
          <div
            className="absolute top-3 left-3 rounded-full px-3 py-1 label-luxury text-white"
            style={{ background: "var(--color-tertiary)" }}
          >
            Featured
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="label-luxury text-[10px]"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="headline-sm text-lg" style={{ fontFamily: "var(--font-noto-serif, var(--font-serif))" }}>
          {template.name}
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
          {template.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="title-md" style={{ color: "var(--color-tertiary)" }}>
            {formatPrice(template.price)}
          </p>
          <ButtonPrimary
            size="sm"
            onClick={() => addItem(template)}
            disabled={inCart}
          >
            <ShoppingBag size={14} />
            {inCart ? "In Cart" : "Add to Cart"}
          </ButtonPrimary>
        </div>
      </div>
    </motion.div>
  );
}
