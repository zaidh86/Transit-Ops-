"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api, buildQuery } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import { ANALYTICS_ROOT_KEY, queryKeys } from "./keys";
import type {
  CompleteTripPayload,
  CreateTripPayload,
  Trip,
  TripFilters,
} from "@/lib/types";

function listTrips(filters: TripFilters): Promise<Trip[]> {
  const query = buildQuery({
    status: filters.status,
    driverId: filters.driverId,
    vehicleId: filters.vehicleId,
  });
  return api
    .get<{ trips: Trip[]; count: number }>(`${ENDPOINTS.trips}${query}`)
    .then((data) => data.trips);
}

export function useTrips(
  filters: TripFilters = {}
): UseQueryResult<Trip[], Error> {
  return useQuery({
    queryKey: queryKeys.trips(filters),
    queryFn: () => listTrips(filters),
  });
}

/**
 * Dispatching, completing and cancelling a trip all flip the assigned vehicle
 * AND driver between AVAILABLE and ON_TRIP on the server. If we only
 * invalidated the trips cache, the vehicles and drivers screens would keep
 * showing stale availability until a refetch happened to fire.
 */
function invalidateTripLifecycle(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.trips() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.drivers() });
  void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTripPayload) =>
      api
        .post<{ trip: Trip }>(ENDPOINTS.trips, payload)
        .then((data) => data.trip),
    // A draft does not change vehicle or driver status, but it does consume
    // them from the operator's point of view, so refresh the lot anyway.
    onSuccess: () => invalidateTripLifecycle(queryClient),
  });
}

export function useDispatchTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<{ trip: Trip }>(`${ENDPOINTS.trips}/${id}/dispatch`)
        .then((data) => data.trip),
    onSuccess: () => invalidateTripLifecycle(queryClient),
  });
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: CompleteTripPayload & { id: string }) =>
      api
        .patch<{ trip: Trip }>(`${ENDPOINTS.trips}/${id}/complete`, payload)
        .then((data) => data.trip),
    onSuccess: () => invalidateTripLifecycle(queryClient),
  });
}

export function useCancelTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<{ trip: Trip }>(`${ENDPOINTS.trips}/${id}/cancel`)
        .then((data) => data.trip),
    onSuccess: () => invalidateTripLifecycle(queryClient),
  });
}
