"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ModulePage } from "@/components/feature/ModulePage";
import { DRIVER_STATUS_META } from "@/lib/constants";
import type { Driver } from "@/types";

const drivers: Driver[] = [
  {
    id: "drv-001",
    name: "Alex Morgan",
    licenseNumber: "DL-10458",
    licenseCategory: "C1",
    licenseExpiryDate: "2027-02-14",
    contactNumber: "+1-555-0104",
    safetyScore: 96,
    status: "AVAILABLE",
  },
  {
    id: "drv-002",
    name: "Fatima Hassan",
    licenseNumber: "DL-20481",
    licenseCategory: "C",
    licenseExpiryDate: "2026-10-02",
    contactNumber: "+1-555-0116",
    safetyScore: 91,
    status: "ON_TRIP",
  },
  {
    id: "drv-003",
    name: "Jordan Lee",
    licenseNumber: "DL-11922",
    licenseCategory: "B",
    licenseExpiryDate: "2026-12-09",
    contactNumber: "+1-555-0142",
    safetyScore: 78,
    status: "SUSPENDED",
  },
  {
    id: "drv-004",
    name: "Priya Nair",
    licenseNumber: "DL-30915",
    licenseCategory: "C1",
    licenseExpiryDate: "2026-08-20",
    contactNumber: "+1-555-0189",
    safetyScore: 88,
    status: "OFF_DUTY",
  },
];

export default function DriversPage() {
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
        { label: "Registered", value: "18" },
        { label: "Available", value: "9" },
        { label: "On trip", value: "5" },
        { label: "Suspended", value: "1" },
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
                  {drivers.map((driver) => {
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