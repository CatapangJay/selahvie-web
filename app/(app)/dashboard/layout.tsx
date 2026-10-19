import RequireAuth from "@/components/auth/RequireAuth";
import SyncNotice from "@/components/dashboard/SyncNotice";

/**
 * Gates every /dashboard route (overview, customize, manage) behind a
 * session. Unauthenticated visitors are redirected to /login.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <SyncNotice />
      {children}
    </RequireAuth>
  );
}
