import AppHeader from "@/components/layout/AppHeader";
import CartDrawer from "@/components/cart/CartDrawer";

/** Signed-in app shell: no marketing navigation or footer. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // bmg-app: the signed-in app speaks in the Be My Guest UI face (see globals.css).
    <div className="bmg-app">
      <AppHeader />
      <main>{children}</main>
      <CartDrawer />
    </div>
  );
}
