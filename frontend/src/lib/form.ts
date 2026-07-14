import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiClientError } from "@/lib/api";

/**
 * Projects a 400's `details[]` onto the matching form inputs.
 *
 * The backend validates everything the client does and more, and it reports
 * failures per-field (`{ field: "cargoWeight", message: "..." }`). Mapping them
 * back onto the inputs means a server rejection lands on the offending control
 * rather than as an anonymous banner.
 *
 * Returns true when at least one error was attached to a known field, so the
 * caller can decide whether anything is left over for the banner.
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: readonly Path<T>[]
): boolean {
  if (!(error instanceof ApiClientError) || !error.details?.length) {
    return false;
  }

  let applied = false;

  for (const detail of error.details) {
    const field = detail.field as Path<T>;
    if (knownFields.includes(field)) {
      setError(field, { type: "server", message: detail.message });
      applied = true;
    }
  }

  return applied;
}
