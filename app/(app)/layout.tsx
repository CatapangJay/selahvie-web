import AppHeader from "@/components/layout/AppHeader";
import CartDrawer from "@/components/cart/CartDrawer";

/** Signed-in app shell: no marketing navigation or footer. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
      <CartDrawer />
    </>
  );
}
