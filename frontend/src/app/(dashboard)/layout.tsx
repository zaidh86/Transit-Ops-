import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";

/**
 * Every screen in the (dashboard) group requires a session. Per-screen role
 * limits are applied by the pages that need them — only the analytics-backed
 * screens are restricted, and the backend enforces all of it regardless.
 */
export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
