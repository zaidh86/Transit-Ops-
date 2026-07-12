"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/types";
import { ShieldAlert } from "lucide-react";

/**
 * Wrap a page's content to restrict it to specific roles.
 * The backend is the real enforcement point (RBAC middleware) — this just
 * keeps people from landing on a screen that isn't meant for their role.
 */
export function RoleGuard({
  allow,
  children,
  redirectTo = "/dashboard",
}: {
  allow: Role[];
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { role, isLoading } = useAuth();
  const router = useRouter();
  const allowed = !!role && allow.includes(role);

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace(redirectTo);
    }
  }, [isLoading, allowed, redirectTo, router]);

  if (isLoading) return null;

  if (!allowed) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <ShieldAlert className="h-8 w-8 text-status-suspended" />
        <p className="text-sm text-muted">
          You don&apos;t have access to this section. Redirecting…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
