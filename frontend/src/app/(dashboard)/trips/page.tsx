"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ModulePage } from "@/components/feature/ModulePage";
import { TRIP_STATUS_META } from "@/lib/constants";
import type { Trip } from "@/types";

const trips: Trip[] = [
  {
    id: "trip-001",
    source: "Central Depot",
    destination: "North Hub",
    vehicleId: "veh-001",
    driverId: "drv-001",
    cargoWeight: 450,
    plannedDistance: 84,
    status: "DRAFT",
    createdAt: "2026-07-11",
  },
  {
    id: "trip-002",
    source: "Warehouse 2",
    destination: "Airport Cargo",
    vehicleId: "veh-002",
    driverId: "drv-002",
    cargoWeight: 1800,
    plannedDistance: 126,
    status: "DISPATCHED",
    createdAt: "2026-07-12",
  },
  {
    id: "trip-003",
    source: "South Yard",
    destination: "City Center",
    vehicleId: "veh-003",
    driverId: "drv-004",
    cargoWeight: 720,
    plannedDistance: 61,
    status: "COMPLETED",
    createdAt: "2026-07-10",
  },
  {
    id: "trip-004",
    source: "Intermodal Port",
    destination: "East Dock",
    vehicleId: "veh-001",
    driverId: "drv-001",
    cargoWeight: 300,
    plannedDistance: 45,
    status: "CANCELLED",
    createdAt: "2026-07-09",
  },
];

export default function TripsPage() {
  return (
    <ModulePage
      eyebrow="Operations / trips"
      title="Trip management"
      description="Trips move through draft, dispatch, completion, and cancellation while enforcing cargo and availability rules."
      actions={
        <>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button>Create trip</Button>
        </>
      }
      stats={[
        { label: "Draft", value: "4" },
        { label: "Dispatched", value: "7" },
        { label: "Completed", value: "19" },
        { label: "Cancelled", value: "1" },
      ]}
      panels={[
        {
          title: "Trip queue",
          description: "Cargo weight should never exceed the selected vehicle's capacity.",
          accentColor: "var(--status-ontrip)",
          children: (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-2">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4">Source</th>
                    <th className="py-2 pr-4">Destination</th>
                    <th className="py-2 pr-4">Vehicle</th>
                    <th className="py-2 pr-4">Driver</th>
                    <th className="py-2 pr-4">Cargo</th>
                    <th className="py-2 pr-4">Distance</th>
                    <th className="py-2 pr-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => {
                    const meta = TRIP_STATUS_META[trip.status];
                    return (
                      <tr key={trip.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 text-foreground">{trip.source}</td>
                        <td className="py-3 pr-4 text-foreground">{trip.destination}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-foreground">{trip.vehicleId}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-foreground">{trip.driverId}</td>
                        <td className="py-3 pr-4 text-muted">{trip.cargoWeight.toLocaleString()} kg</td>
                        <td className="py-3 pr-4 text-muted">{trip.plannedDistance} km</td>
                        <td className="py-3 pr-2">
                          <StatusBadge label={meta.label} color={meta.color} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          title: "Lifecycle rules",
          description: "Status transitions drive vehicle and driver state changes.",
          accentColor: "var(--status-available)",
          children: (
            <div className="space-y-3 text-sm text-muted">
              <div className="rounded-md border border-border bg-background/50 p-4">
                Draft, dispatched, completed, and cancelled states should remain visible in the UI and easy to audit.
              </div>
              <div className="space-y-2 text-xs text-foreground">
                <div className="rounded-md border border-border bg-background/50 px-3 py-2">Dispatching sets vehicle and driver to On Trip.</div>
                <div className="rounded-md border border-border bg-background/50 px-3 py-2">Completing returns both to Available.</div>
                <div className="rounded-md border border-border bg-background/50 px-3 py-2">Cancelling a dispatched trip restores availability.</div>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}