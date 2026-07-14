"use client";

import type { FormEventHandler, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiClientError } from "@/lib/api";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  isSubmitting: boolean;
  /** The rejected mutation, if the last submit failed. */
  error: Error | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}

/**
 * The shell every create/edit form renders into.
 *
 * The error banner exists because the backend enforces rules the client cannot
 * fully predict — a 409 like "Cargo weight exceeds capacity" or "Driver is no
 * longer available" can only come back at submit time. Those messages are
 * written for the operator, so we surface them verbatim.
 *
 * Field-level 400 details are applied to the individual inputs by the caller;
 * this banner carries whatever is left.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  children,
}: FormDialogProps) {
  // A 400 has already been mapped onto the offending fields, so repeating the
  // generic "Validation failed" above them would be noise.
  const isFieldLevel =
    error instanceof ApiClientError &&
    error.status === 400 &&
    error.details !== undefined &&
    error.details.length > 0;

  const bannerMessage = error && !isFieldLevel ? error.message : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {bannerMessage && (
            <p
              role="alert"
              className="rounded-md border border-status-suspended/40 bg-status-suspended/10 px-3 py-2 text-sm text-status-suspended"
            >
              {bannerMessage}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">{children}</div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
