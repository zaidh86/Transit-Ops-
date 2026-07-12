"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModulePage } from "@/components/feature/ModulePage";

const fuelLogs = [
  { id: "fuel-001", vehicleId: "veh-001", liters: 82, cost: 128, date: "2026-07-12" },
  { id: "fuel-002", vehicleId: "veh-002", liters: 190, cost: 312, date: "2026-07-11" },
  { id: "fuel-003", vehicleId: "veh-003", liters: 65, cost: 109, date: "2026-07-10" },
];

const expenses = [
  { id: "exp-001", vehicleId: "veh-001", category: "Toll", amount: 24, date: "2026-07-12", notes: "North corridor" },
  { id: "exp-002", vehicleId: "veh-003", category: "Maintenance", amount: 340, date: "2026-07-12", notes: "Oil change" },
  { id: "exp-003", vehicleId: "veh-002", category: "Cleaning", amount: 45, date: "2026-07-11", notes: "Post-route" },
];

export default function ExpensesPage() {
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
        { label: "Fuel cost", value: "$549" },
        { label: "Other expenses", value: "$109" },
        { label: "Maintenance cost", value: "$1.4k" },
        { label: "Operational total", value: "$2.1k" },
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
                  {fuelLogs.map((log) => (
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
              {expenses.map((expense) => (
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