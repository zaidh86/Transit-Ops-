"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/types";

interface RoleGuardProps {
  children: ReactNode;
  /** Roles allowed through. Omit to require only that the user is signed in. */
  allow?: Role[];
}

/**
 * Client-side gate for a page.
 *
 * This is a usability layer, NOT a security boundary — the backend's RBAC
 * middleware is the only thing that actually enforces access, and it will 403
 * regardless of what the UI does. All this buys us is that a Safety Officer
 * never lands on a screen that would render nothing but permission errors.
 *
 * A missing session redirects to /login. A wrong role does NOT: being signed in
 * as the wrong role is not an authentication failure, so we say so in place
 * rather than bouncing the user somewhere they did not ask to go.
 */
export function RoleGuard({ children, allow }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Loading…
        </p>
      </div>
    );
  }

  // The redirect above is already in flight.
  if (!user) return null;

  if (allow && !allow.includes(user.role)) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <ShieldAlert className="h-8 w-8 text-status-suspended" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          You don&apos;t have access to this section.
        </p>
        <p className="max-w-md text-sm leading-6 text-muted">
          Signed in as {user.name} ({ROLE_LABELS[user.role]}). This screen is
          limited to {allow.map((role) => ROLE_LABELS[role]).join(" and ")}.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
