"use client";

import { useCartStore } from "@/store/cartStore";
import { useWeddingStore } from "@/store/weddingStore";
import { formatPrice } from "@/lib/utils";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import EmptyState from "@/components/ui/EmptyState";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Smartphone, CreditCard, Check } from "lucide-react";

type Method = "gcash" | "maya" | "card";

const METHODS: { id: Method; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: "gcash", label: "GCash", hint: "Pay with your GCash wallet", icon: Smartphone },
  { id: "maya", label: "Maya", hint: "Pay with your Maya account", icon: Smartphone },
  { id: "card", label: "Card", hint: "Visa, Mastercard, JCB", icon: CreditCard },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { createConfig } = useWeddingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<Method>("gcash");
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", card: "", expiry: "", cvc: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.includes("@")) e.email = "We need a valid email to send your confirmation";
    if (method === "card") {
      if (form.card.replace(/\s/g, "").length < 16) e.card = "Enter a valid 16-digit card number";
      if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "Format: MM/YY";
      if (form.cvc.length < 3) e.cvc = "3-digit CVC required";
    } else {
      // GCash / Maya — mock mobile number
      if (form.mobile.replace(/\D/g, "").length < 11) e.mobile = "Enter your 11-digit mobile number";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));

    // Purchases are tagged to the buyer's email so their account sees them later.
    const email = form.email.trim().toLowerCase();
    const ids: string[] = [];
    items.forEach((item) => ids.push(createConfig(item.templateId, email)));

    clearCart();
    const params = new URLSearchParams({
      ids: ids.join(","),
      email,
      name: form.name.trim(),
      method,
    });
    router.push(`/checkout/success?${params.toString()}`);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6" style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}>
        <EmptyState
          glyph="∅"
          title="Your cart is empty"
          body="Browse the collection and add a template to get started — you'll personalize it and manage RSVPs right after checkout."
          actionLabel="Browse templates"
          actionHref="/templates"
        />
      </div>
    );
  }

  const payLabel = loading
    ? "Processing…"
    : method === "card"
    ? `Pay ${formatPrice(total())}`
    : `Pay ${formatPrice(total())} with ${method === "gcash" ? "GCash" : "Maya"}`;

  return (
    <div
      className="mx-auto max-w-6xl px-6"
      style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}
    >
      <Link
        href="/templates"
        className="mb-10 inline-flex items-center gap-2 label-luxury transition-opacity hover:opacity-70"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        <ArrowLeft size={12} />
        Continue shopping
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <p className="label-luxury mb-2" style={{ color: "var(--color-primary)" }}>Secure checkout</p>
          <h1 className="headline-md mb-10" style={{ fontWeight: 300 }}>Complete your purchase</h1>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Contact */}
            <fieldset>
              <legend className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>
                Your details
              </legend>
              <p className="mb-6 text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
                We&apos;ll email your confirmation and a link to set up your account here.
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputField
                  label="Full name"
                  id="name"
                  autoComplete="name"
                  placeholder="Alexandra Chen"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                />
                <InputField
                  label="Email address"
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="hello@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={errors.email}
                />
              </div>
            </fieldset>

            {/* Payment method */}
            <fieldset>
              <legend className="label-luxury mb-4 flex items-center gap-2" style={{ color: "var(--color-on-surface-muted)" }}>
                <Lock size={10} />
                Payment method
              </legend>

              {/* Method selector */}
              <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Payment method">
                {METHODS.map((m) => {
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => { setMethod(m.id); setErrors({}); }}
                      className="relative flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-all"
                      style={{
                        background: active ? "var(--color-primary-container-strong)" : "var(--color-surface-container)",
                        border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-outline)"}`,
                      }}
                    >
                      {active && (
                        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "var(--color-primary)" }}>
                          <Check size={10} style={{ color: "#fff" }} />
                        </span>
                      )}
                      <m.icon size={20} style={{ color: active ? "var(--color-primary)" : "var(--color-on-surface-variant)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Method-specific fields */}
              <div className="mt-7 space-y-6">
                {method === "card" ? (
                  <>
                    <InputField
                      label="Card number"
                      id="card"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      value={form.card}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                        setForm({ ...form, card: v });
                      }}
                      error={errors.card}
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <InputField
                        label="Expiry date"
                        id="expiry"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={form.expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "");
                          if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                          setForm({ ...form, expiry: v });
                        }}
                        error={errors.expiry}
                      />
                      <InputField
                        label="CVC"
                        id="cvc"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        maxLength={4}
                        value={form.cvc}
                        onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, "") })}
                        error={errors.cvc}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <InputField
                      label={`${method === "gcash" ? "GCash" : "Maya"} mobile number`}
                      id="mobile"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="0917 123 4567"
                      maxLength={13}
                      value={form.mobile}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                        const fmt = v.replace(/(\d{4})(\d{3})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
                        setForm({ ...form, mobile: fmt });
                      }}
                      error={errors.mobile}
                    />
                    <p className="mt-3 text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
                      You&apos;ll be redirected to {method === "gcash" ? "GCash" : "Maya"} to authorize the payment. This is a demo — no real charge is made.
                    </p>
                  </div>
                )}
              </div>
            </fieldset>

            <div>
              <ButtonPrimary type="submit" size="lg" fullWidth disabled={loading}>
                {payLabel}
              </ButtonPrimary>
              <p className="mt-4 text-center label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>
                Encrypted &amp; secure · demo only, no real charges
              </p>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div
            className="sticky top-24 space-y-5 p-6"
            style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
          >
            <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Order summary</p>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.templateId} className="flex gap-3">
                  <div className="relative shrink-0 overflow-hidden" style={{ width: 64, height: 52, borderRadius: "var(--radius-sm)" }}>
                    <Image src={item.template.previewImage} alt={item.template.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{item.template.name}</p>
                    <p className="label-luxury mt-0.5" style={{ color: "var(--color-on-surface-muted)" }}>
                      {item.template.tags.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                  <p className="shrink-0 font-serif text-sm" style={{ fontFamily: "var(--font-serif)", fontWeight: 300, color: "var(--color-primary)", fontSize: "1rem" }}>
                    {formatPrice(item.template.price)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-5" style={{ borderTop: "1px solid var(--color-outline)" }}>
              <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Total</p>
              <p className="font-serif" style={{ fontFamily: "var(--font-serif)", fontSize: "1.375rem", fontWeight: 300, color: "var(--color-primary)" }}>
                {formatPrice(total())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
