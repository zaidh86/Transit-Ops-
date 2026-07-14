"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { api, downloadFile } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import { queryKeys } from "./keys";
import type { DashboardKpis, VehicleMetrics } from "@/lib/types";

/**
 * The dashboard endpoint is the one place the backend returns its payload as
 * `data` itself rather than under a named key — so there is nothing to unwrap.
 */
function fetchDashboardKpis(): Promise<DashboardKpis> {
  return api.get<DashboardKpis>(ENDPOINTS.analytics.dashboard);
}

export function useDashboardKpis(): UseQueryResult<DashboardKpis, Error> {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: fetchDashboardKpis,
  });
}

function fetchFleetSummary(): Promise<VehicleMetrics[]> {
  return api
    .get<{ fleet: VehicleMetrics[]; count: number }>(
      ENDPOINTS.analytics.fleetSummary
    )
    .then((data) => data.fleet);
}

export function useFleetSummary(): UseQueryResult<VehicleMetrics[], Error> {
  return useQuery({
    queryKey: queryKeys.fleetSummary(),
    queryFn: fetchFleetSummary,
  });
}

/**
 * There is deliberately no binding for GET /analytics/vehicle-roi: its payload
 * is a strict subset of fleet-summary, which already carries `roi` per vehicle.
 * The analytics screen renders ROI from that, so a second request would fetch
 * the same numbers twice. The endpoint still exists server-side.
 */

/** Streams the fleet summary as a CSV attachment. Bypasses the JSON envelope. */
export function downloadFleetSummaryCsv(): Promise<void> {
  return downloadFile(
    `${ENDPOINTS.analytics.fleetSummary}?format=csv`,
    "fleet-summary.csv"
  );
}
