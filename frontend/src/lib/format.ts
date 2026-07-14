/** Display formatters. Keep every number/date rendering decision in one place. */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Renders both the `YYYY-MM-DD` DTO dates and the full ISO timestamps. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatKilometres(value: number): string {
  return `${numberFormatter.format(value)} km`;
}

export function formatKilograms(value: number): string {
  return `${numberFormatter.format(value)} kg`;
}

export function formatLitres(value: number): string {
  return `${numberFormatter.format(value)} L`;
}

/** The backend sends ROI as a ratio (0.148), not a percentage. */
export function formatRoi(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatEfficiency(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(2)} km/L`;
}

/** `YYYY-MM-DD`, the format the date inputs and the backend both expect. */
export function toDateInputValue(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
}

export function isLicenceExpired(licenseExpiry: string): boolean {
  const expiry = new Date(licenseExpiry);
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now();
}
