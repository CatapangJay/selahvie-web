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
    <div
      className="mx-auto max-w-7xl px-6"
      style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}
    >
      {/* Back */}
      <Link
        href="/templates"
        className="inline-flex items-center gap-2 mb-12 label-luxury transition-opacity hover:opacity-70"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        <ArrowLeft size={12} />
        Back to templates
      </Link>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Left: Images */}
        <div className="space-y-3">
          <div
            className="relative overflow-hidden shadow-ambient"
            style={{ aspectRatio: "4/5", borderRadius: "var(--radius-md)" }}
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
            <div className="grid grid-cols-2 gap-3">
              {template.previewImages.map((src, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "16/9", borderRadius: "var(--radius-sm)" }}
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
        <div className="lg:sticky lg:top-24 lg:h-fit">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="label-luxury px-2.5 py-1"
                style={{
                  background: "var(--color-surface-container-high)",
                  color: "var(--color-on-surface-muted)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-outline)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className="headline-md"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            {template.name}
          </h1>

          <p
            className="mt-5 text-sm font-light leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)", maxWidth: 480 }}
          >
            {template.longDescription}
          </p>

          {/* Price */}
          <div
            className="mt-8 pb-8"
            style={{ borderBottom: "1px solid var(--color-outline)" }}
          >
            <p
              className="font-serif"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                fontWeight: 300,
                lineHeight: 1,
                color: "var(--color-primary)",
              }}
            >
              {formatPrice(template.price)}
            </p>
            <p className="label-luxury mt-2" style={{ color: "var(--color-on-surface-muted)" }}>one-time purchase</p>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonPrimary size="lg" onClick={handleCart} fullWidth>
              <ShoppingBag size={16} />
              {inCart ? "View in cart" : "Add to cart"}
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
            <p className="label-luxury mb-5" style={{ color: "var(--color-on-surface-muted)" }}>
              What&apos;s included
            </p>
            <ul className="space-y-3">
              {template.features.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-sm font-light">
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--color-primary)" }}
                  />
                  <span style={{ color: "var(--color-on-surface-variant)" }}>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Color Palettes */}
          <div className="mt-10">
            <p className="label-luxury mb-5" style={{ color: "var(--color-on-surface-muted)" }}>
              Color palettes
            </p>
            <div className="flex flex-col gap-2">
              {template.colorPalettes.map((palette) => (
                <div
                  key={palette.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    background: "var(--color-surface-container)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-outline)",
                  }}
                >
                  <div className="flex gap-1.5">
                    {[palette.primary, palette.accent, palette.background].map((color, i) => (
                      <div
                        key={i}
                        className="h-5 w-5"
                        style={{
                          background: color,
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-light" style={{ color: "var(--color-on-surface-variant)" }}>
                    {palette.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
