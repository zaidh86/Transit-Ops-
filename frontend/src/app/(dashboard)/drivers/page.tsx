"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ModulePage } from "@/components/feature/ModulePage";
import api from "@/lib/api";
import { DRIVER_STATUS_META } from "@/lib/constants";
import type { Driver } from "@/types";

async function fetchDrivers(): Promise<Driver[]> {
  const { data } = await api.get<{ drivers: Driver[] }>("/drivers");
  return data.drivers;
}

export default function DriversPage() {
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
  });

  const availableCount = drivers.filter((driver) => driver.status === "AVAILABLE").length;
  const onTripCount = drivers.filter((driver) => driver.status === "ON_TRIP").length;
  const suspendedCount = drivers.filter((driver) => driver.status === "SUSPENDED").length;

  return (
    <ModulePage
      eyebrow="Fleet / drivers"
      title="Driver management"
      description="Driver profiles include license validity, safety score, and current assignment eligibility."
      actions={
        <>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button>Add driver</Button>
        </>
      }
      stats={[
        { label: "Registered", value: String(drivers.length) },
        { label: "Available", value: String(availableCount) },
        { label: "On trip", value: String(onTripCount) },
        { label: "Suspended", value: String(suspendedCount) },
      ]}
      panels={[
        {
          title: "Driver roster",
          description: "License expiry and status determine whether a driver can be assigned to a trip.",
          accentColor: "var(--status-available)",
          children: (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-2">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">License</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Expiry</th>
                    <th className="py-2 pr-4">Contact</th>
                    <th className="py-2 pr-4">Score</th>
                    <th className="py-2 pr-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="py-6 text-sm text-muted" colSpan={7}>
                        Loading drivers…
                      </td>
                    </tr>
                  ) : drivers.length === 0 ? (
                    <tr>
                      <td className="py-6 text-sm text-muted" colSpan={7}>
                        No drivers found.
                      </td>
                    </tr>
                  ) : drivers.map((driver) => {
                    const meta = DRIVER_STATUS_META[driver.status];
                    return (
                      <tr key={driver.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 text-foreground">{driver.name}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-foreground">{driver.licenseNumber}</td>
                        <td className="py-3 pr-4 text-muted">{driver.licenseCategory}</td>
                        <td className="py-3 pr-4 text-muted">{driver.licenseExpiryDate}</td>
                        <td className="py-3 pr-4 text-muted">{driver.contactNumber}</td>
                        <td className="py-3 pr-4 text-muted">{driver.safetyScore}</td>
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
          title: "Assignment rules",
          description: "Expired licenses or suspended drivers must be blocked from trip assignment.",
          accentColor: "var(--status-suspended)",
          children: (
            <div className="space-y-3 text-sm text-muted">
              <div className="rounded-md border border-border bg-background/50 p-4">
                The frontend can surface soon-to-expire licenses and low safety scores before dispatch starts.
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Expired license alerts",
                  "Safety score thresholds",
                  "Assignment pool filtering",
                  "Contact details",
                ].map((item) => (
                  <div key={item} className="rounded-md border border-border bg-background/50 px-3 py-2 text-xs text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}