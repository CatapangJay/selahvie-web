import RequireAuth from "@/components/auth/RequireAuth";

/**
 * Gates every /dashboard route (overview, customize, manage) behind a mock
 * session. Unauthenticated visitors are redirected to /login.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
