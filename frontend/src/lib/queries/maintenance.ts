"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";
import { ANALYTICS_ROOT_KEY, queryKeys } from "./keys";
import type {
  CreateMaintenancePayload,
  MaintenanceLog,
  UpdateMaintenancePayload,
} from "@/lib/types";

function listMaintenance(): Promise<MaintenanceLog[]> {
  return api
    .get<{ maintenanceLogs: MaintenanceLog[] }>(ENDPOINTS.maintenance)
    .then((data) => data.maintenanceLogs);
}

export function useMaintenanceLogs(): UseQueryResult<MaintenanceLog[], Error> {
  return useQuery({
    queryKey: queryKeys.maintenance(),
    queryFn: listMaintenance,
  });
}

/**
 * Every maintenance write re-syncs the vehicle's status on the server: opening
 * a log forces the vehicle IN_SHOP, closing the last one restores it to
 * AVAILABLE. So the vehicles cache is stale after any of these.
 */
function invalidateMaintenance(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.maintenance() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles() });
  void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) =>
      api
        .post<{ maintenanceLog: MaintenanceLog }>(
          ENDPOINTS.maintenance,
          payload
        )
        .then((data) => data.maintenanceLog),
    onSuccess: () => invalidateMaintenance(queryClient),
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: UpdateMaintenancePayload & { id: string }) =>
      api
        .patch<{ maintenanceLog: MaintenanceLog }>(
          `${ENDPOINTS.maintenance}/${id}`,
          payload
        )
        .then((data) => data.maintenanceLog),
    onSuccess: () => invalidateMaintenance(queryClient),
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`${ENDPOINTS.maintenance}/${id}`),
    onSuccess: () => invalidateMaintenance(queryClient),
  });
}
