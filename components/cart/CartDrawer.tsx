"use client";

import { useCartStore } from "@/store/cartStore";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import CartItemCard from "./CartItemCard";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const { isOpen, closeCart, items, total, clearCart } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(28,27,25,0.45)" }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md flex flex-col"
            style={{
              background: "var(--color-surface-container-low)",
              boxShadow: "-12px 0 40px rgba(28,27,25,0.12), -2px 0 8px rgba(28,27,25,0.06)",
              borderLeft: "1px solid var(--color-outline)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid var(--color-outline)" }}
            >
              <div>
                <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Your selection</p>
                <p
                  className="font-serif mt-0.5"
                  style={{ fontFamily: "var(--font-serif)", fontSize: "1.375rem", fontWeight: 300, color: "var(--color-on-surface)" }}
                >
                  {items.length} {items.length === 1 ? "template" : "templates"}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="transition-opacity hover:opacity-60"
                style={{ color: "var(--color-on-surface-variant)" }}
                aria-label="Close cart"
              >
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-5">
                  <p
                    className="font-serif"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "3.5rem",
                      fontWeight: 300,
                      color: "var(--color-outline)",
                      fontStyle: "italic",
                    }}
                  >
                    &empty;
                  </p>
                  <div>
                    <p className="title-md" style={{ color: "var(--color-on-surface)", fontWeight: 400 }}>Nothing here yet</p>
                    <p className="text-sm mt-1 font-light" style={{ color: "var(--color-on-surface-variant)" }}>
                      Browse our templates to find your style.
                    </p>
                  </div>
                  <ButtonSecondary onClick={closeCart} size="sm">Browse templates</ButtonSecondary>
                </div>
              ) : (
                items.map((item) => (
                  <CartItemCard key={item.templateId} item={item} />
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="px-6 py-6 space-y-4"
                style={{ borderTop: "1px solid var(--color-outline)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Total</p>
                  <p
                    className="font-serif"
                    style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 300, color: "var(--color-primary)" }}
                  >
                    {formatPrice(total())}
                  </p>
                </div>
                <ButtonPrimary fullWidth onClick={handleCheckout} size="lg">
                  Complete purchase
                </ButtonPrimary>
                <button
                  onClick={clearCart}
                  className="w-full text-center label-luxury transition-colors"
                  style={{ color: "var(--color-on-surface-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-on-surface-muted)")}
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
