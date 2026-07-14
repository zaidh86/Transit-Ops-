"use client";

import { cloneElement, useId, type ReactElement } from "react";
import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** A single form control. Receives `id` and the aria wiring automatically. */
  children: ReactElement<{
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
}

/** Label + control + error, wired for screen readers. */
export function Field({
  label,
  error,
  hint,
  required = false,
  children,
}: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const describedBy = error || hint ? messageId : undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-0.5 text-status-suspended" aria-hidden>
            *
          </span>
        )}
      </Label>

      {cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}

      {error ? (
        <p id={messageId} className="text-xs text-status-suspended">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
