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
            className="fixed inset-0 z-40"
            style={{ background: "rgba(28,27,26,0.4)" }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md flex flex-col"
            style={{ background: "var(--color-surface)", boxShadow: "-8px 0 48px rgba(28,27,26,0.12)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid rgba(209,197,180,0.3)" }}
            >
              <div>
                <p className="label-luxury text-[var(--color-on-surface-variant)]">Your Selection</p>
                <p className="headline-sm mt-0.5">{items.length} {items.length === 1 ? "template" : "templates"}</p>
              </div>
              <button onClick={closeCart} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors" aria-label="Close cart">
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <p className="text-4xl">💍</p>
                  <p className="title-md text-[var(--color-on-surface)]">Your cart is empty</p>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Browse our templates to find your perfect wedding style.</p>
                  <ButtonSecondary onClick={closeCart} size="sm">Browse Templates</ButtonSecondary>
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
                style={{ borderTop: "1px solid rgba(209,197,180,0.3)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="label-luxury text-[var(--color-on-surface-variant)]">Total</p>
                  <p className="title-md text-[var(--color-tertiary)]">{formatPrice(total())}</p>
                </div>
                <ButtonPrimary fullWidth onClick={handleCheckout} size="lg">
                  Checkout
                </ButtonPrimary>
                <button
                  onClick={clearCart}
                  className="w-full text-center label-luxury text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors"
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
