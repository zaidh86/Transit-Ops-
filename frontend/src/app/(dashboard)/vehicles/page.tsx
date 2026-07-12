"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ModulePage } from "@/components/feature/ModulePage";
import { VEHICLE_STATUS_META } from "@/lib/constants";
import type { Vehicle } from "@/types";

const vehicles: Array<Vehicle & { region: string }> = [
  {
    id: "veh-001",
    registrationNumber: "VAN-05",
    name: "Transit Van 05",
    type: "Van",
    maxLoadCapacity: 500,
    odometer: 48210,
    acquisitionCost: 184000,
    status: "AVAILABLE",
    region: "North Hub",
  },
  {
    id: "veh-002",
    registrationNumber: "TRK-12",
    name: "Heavy Truck 12",
    type: "Truck",
    maxLoadCapacity: 2200,
    odometer: 90220,
    acquisitionCost: 420000,
    status: "ON_TRIP",
    region: "Central Yard",
  },
  {
    id: "veh-003",
    registrationNumber: "BUS-08",
    name: "Shuttle Bus 08",
    type: "Bus",
    maxLoadCapacity: 1800,
    odometer: 67110,
    acquisitionCost: 365000,
    status: "IN_SHOP",
    region: "South Depot",
  },
  {
    id: "veh-004",
    registrationNumber: "SUV-19",
    name: "Utility SUV 19",
    type: "SUV",
    maxLoadCapacity: 350,
    odometer: 30240,
    acquisitionCost: 96000,
    status: "RETIRED",
    region: "East Yard",
  },
];

export default function VehiclesPage() {
  return (
    <ModulePage
      eyebrow="Fleet / vehicles"
      title="Vehicle registry"
      description="A responsive registry for vehicle identity, load capacity, odometer, acquisition cost, and current state."
      actions={
        <>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button>Add vehicle</Button>
        </>
      }
      stats={[
        { label: "Registered", value: "24", hint: "Unique registration numbers enforced in the product rules." },
        { label: "Available", value: "11" },
        { label: "In shop", value: "3" },
        { label: "Retired", value: "2" },
      ]}
      panels={[
        {
          title: "Vehicle roster",
          description: "The selection pool should exclude retired and in-shop vehicles.",
          accentColor: "var(--status-available)",
          children: (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-2">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4">Registration</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Capacity</th>
                    <th className="py-2 pr-4">Odometer</th>
                    <th className="py-2 pr-4">Region</th>
                    <th className="py-2 pr-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => {
                    const meta = VEHICLE_STATUS_META[vehicle.status];
                    return (
                      <tr key={vehicle.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs text-foreground">{vehicle.registrationNumber}</td>
                        <td className="py-3 pr-4 text-foreground">{vehicle.name}</td>
                        <td className="py-3 pr-4 text-muted">{vehicle.type}</td>
                        <td className="py-3 pr-4 text-muted">{vehicle.maxLoadCapacity.toLocaleString()} kg</td>
                        <td className="py-3 pr-4 text-muted">{vehicle.odometer.toLocaleString()} km</td>
                        <td className="py-3 pr-4 text-muted">{vehicle.region}</td>
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
          title: "Dispatch filters and rules",
          description: "The dashboard spec calls for vehicle type, status, and region filters.",
          accentColor: "var(--status-ontrip)",
          children: (
            <div className="space-y-4 text-sm text-muted">
              <p>
                Filter chips and search controls can sit above the roster while the backend handles the actual data
                query and validation.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "All types",
                  "Available",
                  "On trip",
                  "In shop",
                  "North Hub",
                  "South Depot",
                ].map((chip) => (
                  <span key={chip} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-foreground">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="rounded-md border border-border bg-background/50 p-4 text-xs leading-5 text-muted-2">
                Business rule reminder: retired or in-shop vehicles should never appear in the dispatch selection.
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}