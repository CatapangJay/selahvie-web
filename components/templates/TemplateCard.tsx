"use client";

import { WeddingTemplate } from "@/types/template";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useHydrated } from "@/lib/useHydrated";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import TemplatePreviewMock from "./TemplatePreviewMock";

// Rotating sample couples so the generated preview mocks don't all read alike.
const SAMPLE_COUPLES: [string, string][] = [
  ["Ava", "Liam"],
  ["Sofia", "Noah"],
  ["Mia", "Ethan"],
  ["Isla", "Kai"],
  ["Lena", "Theo"],
];

interface Props {
  template: WeddingTemplate;
  index?: number;
}

export default function TemplateCard({ template, index = 0 }: Props) {
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(template.id);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  // Subscribe to the ids array so the heart re-renders on toggle; treat as
  // not-favorited until hydrated so server/first-render markup matches.
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const favorited = hydrated && favoriteIds.includes(template.id);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

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
        {/* Full-card click → template details; the mock preview uses the
            template's own palette + serif so it truly represents the design. */}
        <Link
          href={`/templates/${template.id}`}
          className="absolute inset-0 z-10 transition-transform duration-700 group-hover:scale-[1.03]"
          aria-label={`View ${template.name} details`}
        >
          <TemplatePreviewMock template={template} couple={SAMPLE_COUPLES[index % SAMPLE_COUPLES.length]} />
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

        {/* Favorite heart — sits above the image link */}
        <button
          type="button"
          onClick={() => toggleFavorite(template.id)}
          aria-pressed={favorited}
          aria-label={favorited ? `Remove ${template.name} from favorites` : `Save ${template.name} to favorites`}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
          style={{ background: "rgba(253,248,247,0.85)", backdropFilter: "blur(6px)" }}
        >
          <Heart
            size={16}
            style={{ color: favorited ? "var(--color-primary)" : "var(--color-on-surface-muted)" }}
            fill={favorited ? "var(--color-primary)" : "none"}
          />
        </button>
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
