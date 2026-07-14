"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/feature/page-header";
import { StatGrid } from "@/components/feature/stat-grid";
import { MaintenanceFormDialog } from "@/components/feature/maintenance/maintenance-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/states";
import { useAuth } from "@/lib/auth-context";
import {
  useDeleteMaintenance,
  useMaintenanceLogs,
} from "@/lib/queries/maintenance";
import { useVehicles } from "@/lib/queries/vehicles";
import { VEHICLE_STATUS_META } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { MaintenanceLog } from "@/lib/types";

export default function MaintenancePage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("FLEET_MANAGER");

  const [editing, setEditing] = useState<MaintenanceLog | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MaintenanceLog | null>(
    null
  );

  const {
    data: logs = [],
    isPending,
    isError,
    error,
    refetch,
  } = useMaintenanceLogs();

  // The maintenance DTO carries only a vehicleId, so we join against the
  // vehicles cache to show something a human can read.
  const { data: vehicles = [] } = useVehicles();
  const deleteMaintenance = useDeleteMaintenance();

  const vehicleLabels = useMemo(
    () =>
      new Map(
        vehicles.map((vehicle) => [vehicle.id, vehicle.registrationNumber])
      ),
    [vehicles]
  );

  const stats = useMemo(() => {
    const openLogs = logs.filter((log) => log.isActive).length;
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

    return [
      {
        label: "Open logs",
        value: String(openLogs),
        hint: "Each keeps its vehicle In Shop.",
      },
      { label: "Closed logs", value: String(logs.length - openLogs) },
      { label: "Total logs", value: String(logs.length) },
      { label: "Service cost", value: formatCurrency(totalCost) },
    ];
  }, [logs]);

  function openCreate(): void {
    setEditing(undefined);
    setIsFormOpen(true);
  }

  function openEdit(log: MaintenanceLog): void {
    setEditing(log);
    setIsFormOpen(true);
  }

  async function confirmDelete(): Promise<void> {
    if (!pendingDelete) return;
    try {
      await deleteMaintenance.mutateAsync(pendingDelete.id);
      toast.success("Maintenance log deleted");
      setPendingDelete(null);
    } catch {
      // Surfaced on the dialog.
    }
  }

  const columns: Column<MaintenanceLog>[] = [
    {
      id: "description",
      header: "Work",
      cell: (log) => (
        <span className="text-foreground">{log.description}</span>
      ),
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: (log) => (
        <span className="font-mono text-xs text-foreground">
          {vehicleLabels.get(log.vehicleId) ?? log.vehicleId}
        </span>
      ),
    },
    {
      id: "cost",
      header: "Cost",
      hideOnMobile: true,
      cell: (log) => (
        <span className="text-muted">{formatCurrency(log.cost)}</span>
      ),
    },
    {
      id: "opened",
      header: "Opened",
      hideOnMobile: true,
      cell: (log) => (
        <span className="text-muted">{formatDate(log.createdAt)}</span>
      ),
    },
    {
      id: "closed",
      header: "Closed",
      hideOnMobile: true,
      cell: (log) => (
        <span className="text-muted">{formatDate(log.closedAt)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (log) => {
        // An open log is precisely what puts the vehicle In Shop, so we badge
        // it with the vehicle status it causes.
        const meta = log.isActive
          ? VEHICLE_STATUS_META.IN_SHOP
          : VEHICLE_STATUS_META.AVAILABLE;
        return (
          <StatusBadge
            label={log.isActive ? "Open" : "Closed"}
            color={meta.color}
          />
        );
      },
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            className: "text-right",
            cell: (log: MaintenanceLog) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit maintenance log"
                  onClick={() => openEdit(log)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete maintenance log"
                  onClick={() => setPendingDelete(log)}
                >
                  <Trash2 className="h-4 w-4 text-status-suspended" />
                </Button>
              </div>
            ),
          } satisfies Column<MaintenanceLog>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fleet / maintenance"
        title="Maintenance logs"
        description="An open log automatically puts its vehicle In Shop and removes it from dispatch. Closing the last open log restores the vehicle to Available."
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create log
            </Button>
          ) : undefined
        }
      />

      <StatGrid stats={stats} isLoading={isPending} />

      <Card>
        <CardContent className="p-4">
          {isError ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : (
            <DataTable
              columns={columns}
              rows={logs}
              getRowId={(log) => log.id}
              isLoading={isPending}
              emptyMessage="No maintenance logs yet."
            />
          )}
        </CardContent>
      </Card>

      <MaintenanceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        log={editing}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            deleteMaintenance.reset();
          }
        }}
        title="Delete maintenance log"
        description="Permanently delete this log. If it was the only open log for its vehicle, the vehicle returns to Available."
        confirmLabel="Delete"
        destructive
        isPending={deleteMaintenance.isPending}
        error={deleteMaintenance.error}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
