"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { templates } from "@/data/templates";
import { getDemoConfig } from "@/data/demoConfigs";
import { resolveTemplate } from "@/components/wedding-templates";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export default function TemplatePreviewPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { addItem, isInCart, openCart } = useCartStore();

  const template = templates.find((t) => t.id === id);
  const config = getDemoConfig(id);

  // Unknown template ID → gentle recovery, not a hard 404.
  if (!template || !config) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-24 text-center">
        <p
          className="font-serif"
          style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", fontWeight: 300, color: "var(--color-outline)", fontStyle: "italic" }}
        >
          &empty;
        </p>
        <h1 className="headline-sm" style={{ fontWeight: 300 }}>Template not found</h1>
        <p className="text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
          We couldn&apos;t find a template to preview. Browse the collection to find your style.
        </p>
        <Link href="/templates" className="btn-primary label-luxury inline-flex min-h-[44px] items-center px-7" style={{ borderRadius: "var(--radius-sm)", color: "#fff" }}>
          Browse templates
        </Link>
      </div>
    );
  }

  const inCart = isInCart(template.id);
  const TemplateComponent = resolveTemplate(template.id);

  const handleCart = () => {
    if (!inCart) addItem(template);
    openCart();
    router.push("/templates");
  };

  return (
    <div className="relative">
      {/* Live, full-bleed template render — no marketplace chrome. */}
      <TemplateComponent config={config} showBranding={false} />

      {/* Floating preview action bar */}
      <motion.div
        initial={reduceMotion ? false : { y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="glass fixed inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 px-6 py-4"
        style={{ zIndex: "var(--z-toast)", borderTop: "1px solid var(--color-outline)" }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/templates/${template.id}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: "var(--color-on-surface)" }}
            aria-label="Back to template details"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>
              Previewing · sample content
            </p>
            <p
              className="font-serif truncate"
              style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", fontWeight: 400, color: "var(--color-on-surface)" }}
            >
              {template.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="font-serif hidden sm:block"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", fontWeight: 300, color: "var(--color-primary)" }}
          >
            {formatPrice(template.price)}
          </span>
          <button
            onClick={handleCart}
            className="btn-primary label-luxury inline-flex min-h-[44px] items-center gap-2 px-6"
            style={{ borderRadius: "var(--radius-sm)", color: "#fff" }}
          >
            <ShoppingBag size={14} />
            {inCart ? "In cart — view" : "Use this template"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
