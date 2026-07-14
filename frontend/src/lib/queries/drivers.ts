"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import { ANALYTICS_ROOT_KEY, queryKeys } from "./keys";
import { isLicenceExpired } from "@/lib/format";
import type {
  CreateDriverPayload,
  Driver,
  UpdateDriverPayload,
} from "@/lib/types";

function listDrivers(): Promise<Driver[]> {
  return api
    .get<{ drivers: Driver[] }>(ENDPOINTS.drivers)
    .then((data) => data.drivers);
}

export function useDrivers(): UseQueryResult<Driver[], Error> {
  return useQuery({
    queryKey: queryKeys.drivers(),
    queryFn: listDrivers,
  });
}

/**
 * Drivers a new trip may actually be assigned to: available, and holding a
 * licence that has not expired. These are the same rules the backend enforces
 * at create and again at dispatch — filtering here means the picker cannot
 * offer a driver that is guaranteed to 409.
 */
export function useAssignableDrivers(): UseQueryResult<Driver[], Error> {
  return useQuery({
    queryKey: queryKeys.drivers(),
    queryFn: listDrivers,
    select: (drivers) =>
      drivers.filter(
        (driver) =>
          driver.status === "AVAILABLE" &&
          !isLicenceExpired(driver.licenseExpiryDate)
      ),
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDriverPayload) =>
      api
        .post<{ driver: Driver }>(ENDPOINTS.drivers, payload)
        .then((data) => data.driver),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers() });
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateDriverPayload & { id: string }) =>
      api
        .patch<{ driver: Driver }>(`${ENDPOINTS.drivers}/${id}`, payload)
        .then((data) => data.driver),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers() });
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`${ENDPOINTS.drivers}/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers() });
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
    },
  });
}
