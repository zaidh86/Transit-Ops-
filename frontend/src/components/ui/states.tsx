import type { ReactNode } from "react";
import { AlertTriangle, Inbox, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: typeof Inbox;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background/40 px-6 py-10 text-center",
        className
      )}
    >
      <Icon className="h-6 w-6 text-muted-2" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-sm leading-6 text-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

/**
 * A 403 is not a failure the user can retry their way out of — it means the
 * backend's RBAC refused this role — so it gets its own copy and no retry.
 */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const isForbidden = error instanceof ApiClientError && error.status === 403;
  const Icon = isForbidden ? ShieldAlert : AlertTriangle;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border px-6 py-10 text-center",
        "border-status-suspended/40 bg-status-suspended/5",
        className
      )}
    >
      <Icon className="h-6 w-6 text-status-suspended" aria-hidden />
      <p className="text-sm font-medium text-foreground">
        {isForbidden ? "You don't have access to this data" : "Something went wrong"}
      </p>
      <p className="max-w-md text-sm leading-6 text-muted">{error.message}</p>
      {!isForbidden && onRetry && (
        <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-surface-raised", className)}
      aria-hidden
    />
  );
}
