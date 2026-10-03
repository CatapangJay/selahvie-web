"use client";

import { useMemo, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Monitor, Smartphone } from "lucide-react";
import { templates } from "@/data/templates";
import { getDemoConfig } from "@/data/demoConfigs";
import { samplePersonalization } from "@/data/demoPersonalization";
import PersonalizedTemplate from "@/components/wedding-templates/_shared/PersonalizedTemplate";
import ViewAsSelect from "@/components/wedding-templates/_shared/ViewAsSelect";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { TIER_INFO, resolveTier, tierPrice } from "@/lib/tiers";
import { findInviteeByCode } from "@/lib/invitations";
import type { Tier } from "@/types/wedding";

interface Props {
  params: Promise<{ id: string }>;
}

export default function TemplatePreviewPage(props: Props) {
  const params = use(props.params);
  const { id } = params;
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { addItem, isInCart, openCart } = useCartStore();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [pickedTier, setTier] = useState<Tier>("personalized");

  const template = templates.find((t) => t.id === id);
  const tier = template ? resolveTier(template, pickedTier) : pickedTier;
  const config = getDemoConfig(id);
  const sample = useMemo(() => (config ? samplePersonalization(config) : null), [config]);
  const [viewAs, setViewAs] = useState<string | null>(null);

  // Unknown template ID → gentle recovery, not a hard 404.
  if (!template || !config || !sample) {
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
  const personalized = tier === "personalized";
  const viewCode = viewAs ?? sample.defaultCode;
  const previewConfig = personalized ? sample.config : config;
  const invitee = personalized ? findInviteeByCode(viewCode, sample.guests, sample.groups) : null;

  const handleCart = () => {
    addItem(template, tier);
    openCart();
    router.push("/templates");
  };

  const isMobile = device === "mobile";
  const rendered = <PersonalizedTemplate config={previewConfig} invitee={invitee} showBranding={false} />;

  return (
    <div className="relative" style={{ paddingBottom: "7.5rem" }}>
      {/* Live template render — no marketplace chrome. Mobile wraps it in a
          phone-width frame on a muted backdrop; desktop is full-bleed. */}
      {isMobile ? (
        <div className="flex justify-center px-4 py-10" style={{ background: "var(--color-surface-container-low)", minHeight: "100vh" }}>
          <div
            className="w-full overflow-hidden"
            style={{
              maxWidth: 400,
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--color-outline)",
              boxShadow: "0 12px 40px rgba(47,30,38,0.12)",
              background: "var(--color-surface)",
            }}
          >
            {rendered}
          </div>
        </div>
      ) : (
        rendered
      )}

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

        <div className="flex flex-wrap items-center gap-3">
          {/* Plan toggle (premium templates are Personalized-only, so no toggle) */}
          {!template.personalizedOnly && (
          <div
            className="flex items-center gap-1 rounded-full p-1"
            style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline)" }}
            role="radiogroup"
            aria-label="Preview plan"
          >
            {(["base", "personalized"] as const).map((t) => {
              const active = tier === t;
              return (
                <button
                  key={t}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTier(t)}
                  className="min-h-[32px] rounded-full px-3 text-xs transition-colors"
                  style={{
                    background: active ? "var(--color-primary)" : "transparent",
                    color: active ? "#fff" : "var(--color-on-surface-variant)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {TIER_INFO[t].label}
                </button>
              );
            })}
          </div>
          )}
          {personalized && (
            <div className="flex items-center gap-2">
              <label htmlFor="preview-view-as" className="text-xs" style={{ color: "var(--color-on-surface-muted)" }}>
                View as
              </label>
              <ViewAsSelect
                id="preview-view-as"
                guests={sample.guests}
                groups={sample.groups}
                value={invitee?.code ?? ""}
                onChange={setViewAs}
                className="min-h-[36px] max-w-[11rem] cursor-pointer rounded-full px-3 text-xs outline-none"
                style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline)", color: "var(--color-on-surface)" }}
              />
            </div>
          )}
          {/* Device toggle */}
          <div
            className="hidden items-center gap-1 rounded-full p-1 sm:flex"
            style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline)" }}
            role="group"
            aria-label="Preview device"
          >
            {([["desktop", Monitor], ["mobile", Smartphone]] as const).map(([key, Icon]) => {
              const active = device === key;
              return (
                <button
                  key={key}
                  onClick={() => setDevice(key)}
                  aria-pressed={active}
                  aria-label={`${key} preview`}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  style={{
                    background: active ? "var(--color-primary)" : "transparent",
                    color: active ? "#fff" : "var(--color-on-surface-muted)",
                  }}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
          <span
            className="font-serif hidden sm:block"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", fontWeight: 300, color: "var(--color-primary)" }}
          >
            {formatPrice(tierPrice(template.price, tier))}
          </span>
          <button
            onClick={handleCart}
            className="btn-primary label-luxury inline-flex min-h-[44px] items-center gap-2 px-6"
            style={{ borderRadius: "var(--radius-sm)", color: "#fff" }}
          >
            <ShoppingBag size={14} />
            {inCart ? `Update cart (${TIER_INFO[tier].label})` : `Use this template`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
