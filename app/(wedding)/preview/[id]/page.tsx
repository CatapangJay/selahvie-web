"use client";

import { useMemo, useState, use, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Monitor, Smartphone, SlidersHorizontal, X } from "lucide-react";
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
  const [optionsOpen, setOptionsOpen] = useState(false);

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
  const rendered = (
    <PersonalizedTemplate
      config={previewConfig}
      invitee={invitee}
      guests={personalized ? sample.guests : undefined}
      showBranding={false}
    />
  );

  // Preview controls, shown inline on wide screens and in the Options panel below `lg`.
  const planToggle = !template.personalizedOnly && (
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
  );
  const viewAsControl = (id: string) =>
    personalized && (
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-xs" style={{ color: "var(--color-on-surface-muted)" }}>
          View as
        </label>
        <ViewAsSelect
          id={id}
          guests={sample.guests}
          groups={sample.groups}
          value={invitee?.code ?? ""}
          onChange={setViewAs}
          className="max-w-[11rem]"
          style={{ background: "var(--color-surface-container)", fontSize: "0.75rem" }}
        />
      </div>
    );
  const deviceToggle = (
    <div
      className="flex items-center gap-1 rounded-full p-1"
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
  );
  const price = (
    <span className="font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", fontWeight: 300, color: "var(--color-primary)" }}>
      {formatPrice(tierPrice(template.price, tier))}
    </span>
  );

  // The bar is one slim row; templates read this to keep full-screen intros clear of it.
  const chrome = { "--preview-chrome-bottom": "calc(3.75rem + env(safe-area-inset-bottom))" } as CSSProperties;

  return (
    <div className="relative" style={{ ...chrome, paddingBottom: "var(--preview-chrome-bottom)" }}>
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
        className="glass fixed inset-x-0 bottom-0"
        style={{ zIndex: "var(--z-toast)", borderTop: "1px solid var(--color-outline)" }}
      >
        {/* Options panel (below lg): opens upward from the bar */}
        <AnimatePresence>
          {optionsOpen && (
            <motion.div
              id="preview-options"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="glass absolute inset-x-0 bottom-full flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 lg:hidden"
              style={{ borderTop: "1px solid var(--color-outline)" }}
            >
              {planToggle}
              {viewAsControl("preview-view-as-panel")}
              <div className="hidden sm:block">{deviceToggle}</div>
              <div className="ml-auto">{price}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 px-3 sm:gap-4 sm:px-6" style={{ height: "3.75rem", marginBottom: "env(safe-area-inset-bottom)" }}>
          <Link
            href={`/templates/${template.id}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-70"
            style={{ color: "var(--color-on-surface)" }}
            aria-label="Back to template details"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="label-luxury hidden sm:block" style={{ color: "var(--color-on-surface-muted)", fontSize: "0.625rem" }}>
              Previewing · sample content
            </p>
            <p
              className="font-serif truncate"
              style={{ fontFamily: "var(--font-serif)", fontSize: "1.0625rem", fontWeight: 400, lineHeight: 1.2, color: "var(--color-on-surface)" }}
            >
              {template.name}
            </p>
          </div>

          {/* Wide screens: every control inline */}
          <div className="hidden items-center gap-3 lg:flex">
            {planToggle}
            {viewAsControl("preview-view-as")}
            {deviceToggle}
            {price}
          </div>

          <button
            type="button"
            onClick={() => setOptionsOpen((o) => !o)}
            aria-expanded={optionsOpen}
            aria-controls="preview-options"
            aria-label={optionsOpen ? "Hide preview options" : "Show preview options"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden"
            style={{
              background: optionsOpen ? "var(--color-primary)" : "var(--color-surface-container)",
              color: optionsOpen ? "#fff" : "var(--color-on-surface)",
              border: "1px solid var(--color-outline)",
            }}
          >
            {optionsOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
          </button>

          <button
            onClick={handleCart}
            className="btn-primary label-luxury inline-flex min-h-[44px] shrink-0 items-center gap-2 px-4 sm:px-6"
            style={{ borderRadius: "var(--radius-sm)", color: "#fff" }}
          >
            <ShoppingBag size={14} />
            <span className="sm:hidden">{inCart ? "Update" : "Use"}</span>
            <span className="hidden sm:inline">{inCart ? `Update cart (${TIER_INFO[tier].label})` : "Use this template"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
