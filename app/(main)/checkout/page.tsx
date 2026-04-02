"use client";

import { useCartStore } from "@/store/cartStore";
import { useWeddingStore } from "@/store/weddingStore";
import { formatPrice } from "@/lib/utils";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { createConfig } = useWeddingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", card: "", expiry: "", cvc: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.card.replace(/\s/g, "").length < 16) e.card = "Enter a valid 16-digit card number";
    if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "Format: MM/YY";
    if (form.cvc.length < 3) e.cvc = "3-digit CVC required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));

    const ids: string[] = [];
    items.forEach((item) => {
      const id = createConfig(item.templateId);
      ids.push(id);
    });

    clearCart();
    router.push(`/checkout/success?ids=${ids.join(",")}`);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center flex flex-col items-center gap-6">
        <p
          className="font-serif"
          style={{ fontFamily: "var(--font-serif)", fontSize: "4rem", fontWeight: 300, color: "var(--color-outline)", fontStyle: "italic" }}
        >
          &empty;
        </p>
        <h1 className="headline-sm" style={{ fontWeight: 300 }}>Your cart is empty</h1>
        <Link href="/templates">
          <ButtonPrimary>Browse templates</ButtonPrimary>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-6xl px-6"
      style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}
    >
      <Link
        href="/templates"
        className="inline-flex items-center gap-2 mb-12 label-luxury transition-opacity hover:opacity-70"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        <ArrowLeft size={12} />
        Continue shopping
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-muted)" }}>Secure checkout</p>
          <h1 className="headline-md mb-10" style={{ fontWeight: 300 }}>Complete your purchase</h1>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Contact */}
            <fieldset>
              <legend
                className="label-luxury mb-6"
                style={{ color: "var(--color-on-surface-muted)" }}
              >
                Contact details
              </legend>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputField
                  label="Full name"
                  id="name"
                  placeholder="Alexandra Chen"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                />
                <InputField
                  label="Email address"
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={errors.email}
                />
              </div>
            </fieldset>

            {/* Payment */}
            <fieldset>
              <legend
                className="label-luxury mb-6 flex items-center gap-2"
                style={{ color: "var(--color-on-surface-muted)" }}
              >
                <Lock size={10} />
                Payment details
              </legend>
              <div className="space-y-6">
                <InputField
                  label="Card number"
                  id="card"
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
                    placeholder="123"
                    maxLength={4}
                    value={form.cvc}
                    onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, "") })}
                    error={errors.cvc}
                  />
                </div>
              </div>
            </fieldset>

            <ButtonPrimary type="submit" size="lg" fullWidth disabled={loading}>
              {loading ? "Processing…" : `Complete purchase · ${formatPrice(total())}`}
            </ButtonPrimary>

            <p
              className="text-center label-luxury"
              style={{ color: "var(--color-on-surface-muted)" }}
            >
              Your payment is encrypted and secure. This is a demo — no real charges will be made.
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div
            className="sticky top-24 p-6 space-y-5"
            style={{
              background: "var(--color-surface-container)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-outline)",
            }}
          >
            <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Order summary</p>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.templateId} className="flex gap-3">
                  <div
                    className="relative shrink-0 overflow-hidden"
                    style={{ width: 64, height: 52, borderRadius: "var(--radius-sm)" }}
                  >
                    <Image
                      src={item.template.previewImage}
                      alt={item.template.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      {item.template.name}
                    </p>
                    <p className="label-luxury mt-0.5" style={{ color: "var(--color-on-surface-muted)" }}>
                      {item.template.tags.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                  <p
                    className="font-serif shrink-0 text-sm"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 300, color: "var(--color-primary)", fontSize: "1rem" }}
                  >
                    {formatPrice(item.template.price)}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="pt-5 flex items-center justify-between"
              style={{ borderTop: "1px solid var(--color-outline)" }}
            >
              <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Total</p>
              <p
                className="font-serif"
                style={{ fontFamily: "var(--font-serif)", fontSize: "1.375rem", fontWeight: 300, color: "var(--color-primary)" }}
              >
                {formatPrice(total())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
