import type { TripFilters, VehicleFilters } from "@/lib/types";

/**
 * Every query key in one place, so an invalidation can never miss a cache entry
 * because a key was spelled differently at the call site.
 */
export const queryKeys = {
  vehicles: (filters?: VehicleFilters) =>
    filters ? (["vehicles", filters] as const) : (["vehicles"] as const),
  drivers: () => ["drivers"] as const,
  trips: (filters?: TripFilters) =>
    filters ? (["trips", filters] as const) : (["trips"] as const),
  maintenance: () => ["maintenance"] as const,
  expenses: () => ["expenses"] as const,
  dashboard: () => ["analytics", "dashboard"] as const,
  fleetSummary: () => ["analytics", "fleet-summary"] as const,
} as const;

/**
 * Analytics is derived from every other table, so any write anywhere can move
 * a KPI. Rather than making each mutation remember that, they all call this.
 */
export const ANALYTICS_ROOT_KEY = ["analytics"] as const;
