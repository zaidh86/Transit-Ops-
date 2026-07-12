"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ModulePage } from "@/components/feature/ModulePage";
import { VEHICLE_STATUS_META } from "@/lib/constants";

const records = [
  {
    id: "mnt-001",
    vehicleId: "veh-003",
    description: "Oil change and inspection",
    cost: 340,
    isActive: true,
    createdAt: "2026-07-12",
    closedAt: undefined,
  },
  {
    id: "mnt-002",
    vehicleId: "veh-001",
    description: "Brake pad replacement",
    cost: 780,
    isActive: false,
    createdAt: "2026-07-01",
    closedAt: "2026-07-04",
  },
  {
    id: "mnt-003",
    vehicleId: "veh-004",
    description: "Electrical diagnostics",
    cost: 210,
    isActive: false,
    createdAt: "2026-06-25",
    closedAt: "2026-06-27",
  },
];

export default function MaintenancePage() {
  return (
    <ModulePage
      eyebrow="Fleet / maintenance"
      title="Maintenance logs"
      description="Active maintenance automatically places a vehicle in shop and removes it from dispatch selection."
      actions={
        <>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button>Create maintenance log</Button>
        </>
      }
      stats={[
        { label: "Active logs", value: "1" },
        { label: "Closed logs", value: "12" },
        { label: "In shop", value: "3" },
        { label: "Service cost", value: "$4.3k" },
      ]}
      panels={[
        {
          title: "Maintenance records",
          description: "Open records keep the vehicle in shop until the work closes out.",
          accentColor: "var(--status-shop)",
          children: (
            <div className="space-y-3 text-sm">
              {records.map((record) => {
                const status = record.isActive ? VEHICLE_STATUS_META.IN_SHOP : VEHICLE_STATUS_META.AVAILABLE;
                return (
                  <div key={record.id} className="rounded-md border border-border bg-background/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{record.description}</div>
                        <div className="mt-1 text-xs text-muted">{record.vehicleId} · created {record.createdAt}</div>
                      </div>
                      <StatusBadge label={status.label} color={status.color} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-3">
                      <div>Cost: ${record.cost}</div>
                      <div>Status: {record.isActive ? "Open" : "Closed"}</div>
                      <div>Closed: {record.closedAt ?? "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        },
        {
          title: "Workflow notes",
          description: "Maintenance should feed both the vehicle state and operational cost totals.",
          accentColor: "var(--status-suspended)",
          children: (
            <div className="space-y-3 text-sm text-muted">
              <div className="rounded-md border border-border bg-background/50 p-4">
                When a log is marked active, the vehicle should move to In Shop and disappear from trip assignment.
              </div>
              <div className="rounded-md border border-border bg-background/50 p-4">
                Closing the log restores the vehicle to Available unless it has been retired.
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}