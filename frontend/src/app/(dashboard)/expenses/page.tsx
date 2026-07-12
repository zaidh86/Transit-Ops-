"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ModulePage } from "@/components/feature/ModulePage";
import api from "@/lib/api";
import type { Expense, FuelLog } from "@/types";

async function fetchExpenseModule(): Promise<{ fuelLogs: FuelLog[]; expenses: Expense[] }> {
  const { data } = await api.get<{ fuelLogs: FuelLog[]; expenses: Expense[] }>("/expenses");
  return data;
}

export default function ExpensesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenseModule,
  });

  const fuelLogs = data?.fuelLogs ?? [];
  const expenses = data?.expenses ?? [];
  const fuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const otherExpenseCost = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const maintenanceCost = expenses
    .filter((expense) => expense.category.toLowerCase().includes("maintenance"))
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <ModulePage
      eyebrow="Finance / fuel & expenses"
      title="Fuel and expense tracking"
      description="Record fuel logs and other operating expenses, then roll them into per-vehicle operational cost summaries."
      actions={
        <>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button>Add expense</Button>
        </>
      }
      stats={[
        { label: "Fuel cost", value: `$${fuelCost.toLocaleString()}` },
        { label: "Other expenses", value: `$${otherExpenseCost.toLocaleString()}` },
        { label: "Maintenance cost", value: `$${maintenanceCost.toLocaleString()}` },
        { label: "Operational total", value: `$${(fuelCost + otherExpenseCost).toLocaleString()}` },
      ]}
      panels={[
        {
          title: "Fuel logs",
          description: "Fuel consumption is the base for efficiency and operational cost calculations.",
          accentColor: "var(--status-ontrip)",
          children: (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-2">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4">Vehicle</th>
                    <th className="py-2 pr-4">Liters</th>
                    <th className="py-2 pr-4">Cost</th>
                    <th className="py-2 pr-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="py-6 text-sm text-muted" colSpan={4}>
                        Loading fuel logs…
                      </td>
                    </tr>
                  ) : fuelLogs.length === 0 ? (
                    <tr>
                      <td className="py-6 text-sm text-muted" colSpan={4}>
                        No fuel logs found.
                      </td>
                    </tr>
                  ) : fuelLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs text-foreground">{log.vehicleId}</td>
                      <td className="py-3 pr-4 text-muted">{log.liters} L</td>
                      <td className="py-3 pr-4 text-muted">${log.cost}</td>
                      <td className="py-3 pr-2 text-muted">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          title: "Other expenses and cost rollup",
          description: "The spec calls for fuel, maintenance, and other expense tracking per vehicle.",
          accentColor: "var(--status-shop)",
          children: (
            <div className="space-y-3 text-sm text-muted">
              {isLoading ? (
                <div className="rounded-md border border-border bg-background/50 p-4">Loading expenses…</div>
              ) : expenses.length === 0 ? (
                <div className="rounded-md border border-border bg-background/50 p-4">No expense records found.</div>
              ) : expenses.map((expense) => (
                <div key={expense.id} className="rounded-md border border-border bg-background/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{expense.category}</div>
                      <div className="mt-1 text-xs text-muted">{expense.vehicleId} · {expense.date}</div>
                    </div>
                    <div className="font-display text-lg font-semibold text-foreground">${expense.amount}</div>
                  </div>
                  {expense.notes ? <div className="mt-2 text-xs text-muted-2">{expense.notes}</div> : null}
                </div>
              ))}
              <div className="rounded-md border border-border bg-background/50 p-4 text-xs leading-5 text-muted-2">
                A future API response can calculate fuel + maintenance totals per vehicle and expose it directly in the UI.
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}