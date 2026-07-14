"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api, buildQuery } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import { ANALYTICS_ROOT_KEY, queryKeys } from "./keys";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  Vehicle,
  VehicleFilters,
} from "@/lib/types";

function listVehicles(filters: VehicleFilters): Promise<Vehicle[]> {
  const query = buildQuery({
    type: filters.type,
    status: filters.status,
    region: filters.region,
    search: filters.search,
  });
  return api
    .get<{ vehicles: Vehicle[]; count: number }>(
      `${ENDPOINTS.vehicles}${query}`
    )
    .then((data) => data.vehicles);
}

export function useVehicles(
  filters: VehicleFilters = {}
): UseQueryResult<Vehicle[], Error> {
  return useQuery({
    queryKey: queryKeys.vehicles(filters),
    queryFn: () => listVehicles(filters),
  });
}

/**
 * Vehicles that a new trip may actually be assigned to. The backend rejects
 * anything else with a 409, so filtering here keeps the picker honest rather
 * than letting the user choose a vehicle that is guaranteed to fail.
 */
export function useAssignableVehicles(): UseQueryResult<Vehicle[], Error> {
  return useVehicles({ status: "AVAILABLE" });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) =>
      api
        .post<{ vehicle: Vehicle }>(ENDPOINTS.vehicles, payload)
        .then((data) => data.vehicle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles() });
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateVehiclePayload & { id: string }) =>
      api
        .patch<{ vehicle: Vehicle }>(`${ENDPOINTS.vehicles}/${id}`, payload)
        .then((data) => data.vehicle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles() });
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    // Vehicles is the one module whose DELETE returns 200 with a body rather
    // than a 204. We discard the body either way.
    mutationFn: (id: string) =>
      api.delete<{ message: string }>(`${ENDPOINTS.vehicles}/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles() });
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
    },
  });
}
