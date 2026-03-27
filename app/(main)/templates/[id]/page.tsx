"use client";

import { templates } from "@/data/templates";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { formatPrice } from "@/lib/utils";
import { Check, ShoppingBag, ArrowLeft } from "lucide-react";

interface Props {
  params: { id: string };
}

export default function TemplateDetailPage({ params }: Props) {
  const template = templates.find((t) => t.id === params.id);
  if (!template) notFound();

  const { addItem, isInCart, openCart } = useCartStore();
  const inCart = isInCart(template.id);

  const handleCart = () => {
    if (!inCart) addItem(template);
    else openCart();
  };

  return (
    <div className="mx-auto max-w-7xl px-6" style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}>
      {/* Back */}
      <Link
        href="/templates"
        className="inline-flex items-center gap-2 mb-10 label-luxury transition-opacity hover:opacity-70"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        <ArrowLeft size={14} />
        Back to Templates
      </Link>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Left: Images */}
        <div className="space-y-4">
          <div
            className="relative overflow-hidden shadow-ambient"
            style={{ aspectRatio: "4/5", borderRadius: "var(--radius-xl)" }}
          >
            <Image
              src={template.previewImage}
              alt={template.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Thumbnails */}
          {template.previewImages.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {template.previewImages.map((src, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "16/9", borderRadius: "var(--radius-lg)" }}
                >
                  <Image
                    src={src}
                    alt={`${template.name} preview ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <div className="flex flex-wrap gap-2 mb-4">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="label-luxury rounded-full px-3 py-1"
                style={{ background: "var(--color-surface-container-low)", color: "var(--color-on-surface-variant)" }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className="headline-md"
            style={{ fontFamily: "var(--font-noto-serif, var(--font-serif))" }}
          >
            {template.name}
          </h1>

          <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
            {template.longDescription}
          </p>

          {/* Price */}
          <div
            className="mt-8 flex items-baseline gap-2"
          >
            <span className="display-lg text-4xl" style={{ color: "var(--color-tertiary)" }}>
              {formatPrice(template.price)}
            </span>
            <span className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>one-time</span>
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonPrimary size="lg" onClick={handleCart} fullWidth>
              <ShoppingBag size={18} />
              {inCart ? "View in Cart" : "Add to Cart"}
            </ButtonPrimary>
            {inCart && (
              <Link href="/checkout" className="flex-1">
                <ButtonSecondary size="lg" fullWidth>
                  Checkout
                </ButtonSecondary>
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="mt-10">
            <p className="label-luxury mb-4" style={{ color: "var(--color-on-surface-variant)" }}>
              What&apos;s Included
            </p>
            <ul className="space-y-3">
              {template.features.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-secondary)" }} />
                  <span style={{ color: "var(--color-on-surface)" }}>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Color Palettes */}
          <div className="mt-10">
            <p className="label-luxury mb-4" style={{ color: "var(--color-on-surface-variant)" }}>
              Color Palettes
            </p>
            <div className="flex flex-col gap-3">
              {template.colorPalettes.map((palette) => (
                <div
                  key={palette.id}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "var(--color-surface-container-low)" }}
                >
                  <div className="flex gap-2">
                    {[palette.primary, palette.accent, palette.background].map((color, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full border-ghost"
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: "var(--color-on-surface)" }}>{palette.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
