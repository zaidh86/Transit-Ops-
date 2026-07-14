"use client";

import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { PageHeader } from "@/components/feature/page-header";
import { StatGrid } from "@/components/feature/stat-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/states";
import {
  downloadFleetSummaryCsv,
  useFleetSummary,
} from "@/lib/queries/analytics";
import { VEHICLE_STATUS_META } from "@/lib/constants";
import {
  formatCurrency,
  formatEfficiency,
  formatKilometres,
  formatLitres,
  formatRoi,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VehicleMetrics } from "@/lib/types";

function AnalyticsContent() {
  const {
    data: fleet = [],
    isPending,
    isError,
    error,
    refetch,
  } = useFleetSummary();

  const [isExporting, setIsExporting] = useState(false);

  const stats = useMemo(() => {
    const totalRevenue = fleet.reduce((sum, row) => sum + row.revenue, 0);
    const totalOperationalCost = fleet.reduce(
      (sum, row) => sum + row.operationalCost,
      0
    );
    const totalDistance = fleet.reduce((sum, row) => sum + row.totalDistance, 0);
    const totalFuel = fleet.reduce((sum, row) => sum + row.fuelConsumed, 0);

    return [
      { label: "Total revenue", value: formatCurrency(totalRevenue) },
      {
        label: "Operational cost",
        value: formatCurrency(totalOperationalCost),
        hint: "Fuel + maintenance.",
      },
      {
        label: "Net margin",
        value: formatCurrency(totalRevenue - totalOperationalCost),
      },
      {
        label: "Fleet efficiency",
        value: formatEfficiency(totalFuel > 0 ? totalDistance / totalFuel : null),
      },
    ];
  }, [fleet]);

  async function handleExport(): Promise<void> {
    setIsExporting(true);
    try {
      await downloadFleetSummaryCsv();
      toast.success("Fleet summary exported");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Export failed"
      );
    } finally {
      setIsExporting(false);
    }
  }

  const columns: Column<VehicleMetrics>[] = [
    {
      id: "vehicle",
      header: "Vehicle",
      cell: (row) => (
        <div>
          <p className="font-mono text-xs text-foreground">
            {row.registrationNumber}
          </p>
          <p className="mt-0.5 text-xs text-muted-2">{row.name}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      hideOnMobile: true,
      cell: (row) => {
        const meta = VEHICLE_STATUS_META[row.status];
        return <StatusBadge label={meta.label} color={meta.color} />;
      },
    },
    {
      id: "trips",
      header: "Trips",
      hideOnMobile: true,
      cell: (row) => (
        <span className="font-mono text-xs text-muted">{row.tripsCompleted}</span>
      ),
    },
    {
      id: "distance",
      header: "Distance",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-muted">{formatKilometres(row.totalDistance)}</span>
      ),
    },
    {
      id: "fuel",
      header: "Fuel",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-muted">{formatLitres(row.fuelConsumed)}</span>
      ),
    },
    {
      id: "efficiency",
      header: "Efficiency",
      hideOnMobile: true,
      cell: (row) => (
        <span className="font-mono text-xs text-muted">
          {formatEfficiency(row.fuelEfficiency)}
        </span>
      ),
    },
    {
      id: "operational",
      header: "Op. cost",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-muted">{formatCurrency(row.operationalCost)}</span>
      ),
    },
    {
      id: "revenue",
      header: "Revenue",
      cell: (row) => (
        <span className="text-foreground">{formatCurrency(row.revenue)}</span>
      ),
    },
    {
      id: "roi",
      header: "ROI",
      className: "text-right",
      cell: (row) => (
        <span
          className={cn(
            "font-mono text-xs",
            row.roi === null
              ? "text-muted-2"
              : row.roi >= 0
                ? "text-status-available"
                : "text-status-suspended"
          )}
        >
          {formatRoi(row.roi)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports / analytics"
        title="Reports and analytics"
        description="Per-vehicle distance, fuel efficiency, operational cost and return on investment, computed from completed trips."
        actions={
          <Button onClick={() => void handleExport()} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export CSV
          </Button>
        }
      />

      <StatGrid stats={stats} isLoading={isPending} />

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fleet summary</CardTitle>
            <CardDescription>
              ROI is (revenue − operational cost) ÷ acquisition cost. Efficiency
              is distance ÷ fuel consumed, and is blank until a trip has been
              completed with a fuel reading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              rows={fleet}
              getRowId={(row) => row.vehicleId}
              isLoading={isPending}
              emptyMessage="No vehicles to report on yet."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** The analytics endpoints are Fleet Manager + Financial Analyst only. */
export default function AnalyticsPage() {
  return (
    <RoleGuard allow={["FLEET_MANAGER", "FINANCIAL_ANALYST"]}>
      <AnalyticsContent />
    </RoleGuard>
  );
}
