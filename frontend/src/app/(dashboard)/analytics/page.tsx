"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModulePage } from "@/components/feature/ModulePage";

const metrics = [
  { label: "Fuel efficiency", value: "7.4 km/L" },
  { label: "Fleet utilization", value: "68%" },
  { label: "Operational cost", value: "$2.1k" },
  { label: "Vehicle ROI", value: "14.8%" },
];

const chartBars = [
  { label: "Fuel", value: 72 },
  { label: "Maintenance", value: 38 },
  { label: "Tolls", value: 24 },
  { label: "Other", value: 14 },
];

export default function AnalyticsPage() {
  return (
    <ModulePage
      eyebrow="Reports / analytics"
      title="Reports and analytics"
      description="Operational metrics help surface fuel efficiency, fleet utilization, cost trends, and ROI from the same dashboard language used across the app."
      actions={
        <>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <Button>Export CSV</Button>
        </>
      }
      stats={metrics}
      panels={[
        {
          title: "Cost profile",
          description: "A lightweight chart treatment keeps the screen useful even before chart libraries are wired in.",
          accentColor: "var(--status-ontrip)",
          children: (
            <div className="space-y-3">
              {chartBars.map((bar) => (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{bar.label}</span>
                    <span className="font-mono text-xs text-muted">{bar.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-background/80">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          title: "Formula notes",
          description: "These notes mirror the product spec so the future backend implementation can plug in cleanly.",
          accentColor: "var(--status-available)",
          children: (
            <div className="space-y-3 text-sm text-muted">
              <div className="rounded-md border border-border bg-background/50 p-4">
                Fuel efficiency = distance driven divided by fuel consumed.
              </div>
              <div className="rounded-md border border-border bg-background/50 p-4">
                Vehicle ROI = (revenue - maintenance - fuel) / acquisition cost.
              </div>
              <div className="rounded-md border border-border bg-background/50 p-4">
                CSV export is already represented in the action row; PDF export can be added later if needed.
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}