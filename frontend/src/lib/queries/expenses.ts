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
  CreateExpensePayload,
  CreateFuelLogPayload,
  Expense,
  ExpenseModule,
  FuelLog,
  UpdateExpensePayload,
  UpdateFuelLogPayload,
} from "@/lib/types";

/** `GET /expenses` returns fuel logs and expense records in a single call. */
function fetchExpenseModule(): Promise<ExpenseModule> {
  return api.get<ExpenseModule>(ENDPOINTS.expenses);
}

export function useExpenseModule(): UseQueryResult<ExpenseModule, Error> {
  return useQuery({
    queryKey: queryKeys.expenses(),
    queryFn: fetchExpenseModule,
  });
}

function invalidateExpenses(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.expenses() });
  void queryClient.invalidateQueries({ queryKey: ANALYTICS_ROOT_KEY });
}

// ---------- Fuel logs ----------

export function useCreateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFuelLogPayload) =>
      api
        .post<{ fuelLog: FuelLog }>(ENDPOINTS.fuelLogs, payload)
        .then((data) => data.fuelLog),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

export function useUpdateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateFuelLogPayload & { id: string }) =>
      api
        .patch<{ fuelLog: FuelLog }>(`${ENDPOINTS.fuelLogs}/${id}`, payload)
        .then((data) => data.fuelLog),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

export function useDeleteFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`${ENDPOINTS.fuelLogs}/${id}`),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

// ---------- Expense records ----------

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) =>
      api
        .post<{ expense: Expense }>(ENDPOINTS.expenseRecords, payload)
        .then((data) => data.expense),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateExpensePayload & { id: string }) =>
      api
        .patch<{ expense: Expense }>(
          `${ENDPOINTS.expenseRecords}/${id}`,
          payload
        )
        .then((data) => data.expense),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`${ENDPOINTS.expenseRecords}/${id}`),
    onSuccess: () => invalidateExpenses(queryClient),
  });
}
