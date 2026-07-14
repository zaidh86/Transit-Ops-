"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/feature/page-header";
import { StatGrid } from "@/components/feature/stat-grid";
import { DriverFormDialog } from "@/components/feature/drivers/driver-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/states";
import { useAuth } from "@/lib/auth-context";
import { useDeleteDriver, useDrivers } from "@/lib/queries/drivers";
import { DRIVER_STATUS_META } from "@/lib/constants";
import { formatDate, isLicenceExpired } from "@/lib/format";
import type { Driver } from "@/lib/types";

/** Below this, a driver is worth flagging to the safety officer. */
const LOW_SAFETY_SCORE = 80;

export default function DriversPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("FLEET_MANAGER");

  const [editing, setEditing] = useState<Driver | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Driver | null>(null);

  const {
    data: drivers = [],
    isPending,
    isError,
    error,
    refetch,
  } = useDrivers();

  const deleteDriver = useDeleteDriver();

  const stats = useMemo(
    () => [
      { label: "Registered", value: String(drivers.length) },
      {
        label: "Available",
        value: String(
          drivers.filter((driver) => driver.status === "AVAILABLE").length
        ),
      },
      {
        label: "On trip",
        value: String(
          drivers.filter((driver) => driver.status === "ON_TRIP").length
        ),
      },
      {
        label: "Expired licences",
        value: String(
          drivers.filter((driver) => isLicenceExpired(driver.licenseExpiryDate))
            .length
        ),
        hint: "An expired licence blocks trip assignment.",
      },
    ],
    [drivers]
  );

  function openCreate(): void {
    setEditing(undefined);
    setIsFormOpen(true);
  }

  function openEdit(driver: Driver): void {
    setEditing(driver);
    setIsFormOpen(true);
  }

  async function confirmDelete(): Promise<void> {
    if (!pendingDelete) return;
    try {
      await deleteDriver.mutateAsync(pendingDelete.id);
      toast.success(`${pendingDelete.name} deleted`);
      setPendingDelete(null);
    } catch {
      // Surfaced on the dialog.
    }
  }

  const columns: Column<Driver>[] = [
    {
      id: "name",
      header: "Name",
      cell: (driver) => <span className="text-foreground">{driver.name}</span>,
    },
    {
      id: "license",
      header: "License",
      cell: (driver) => (
        <span className="font-mono text-xs text-foreground">
          {driver.licenseNumber}
        </span>
      ),
    },
    {
      id: "category",
      header: "Category",
      hideOnMobile: true,
      cell: (driver) => (
        <span className="text-muted">{driver.licenseCategory}</span>
      ),
    },
    {
      id: "expiry",
      header: "Expiry",
      hideOnMobile: true,
      cell: (driver) => {
        const expired = isLicenceExpired(driver.licenseExpiryDate);
        return (
          <span
            className={
              expired
                ? "inline-flex items-center gap-1.5 text-status-suspended"
                : "text-muted"
            }
          >
            {expired && <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
            {formatDate(driver.licenseExpiryDate)}
            {expired && <span className="sr-only">(expired)</span>}
          </span>
        );
      },
    },
    {
      id: "contact",
      header: "Contact",
      hideOnMobile: true,
      cell: (driver) => (
        <span className="text-muted">{driver.contactNumber}</span>
      ),
    },
    {
      id: "score",
      header: "Score",
      hideOnMobile: true,
      cell: (driver) => (
        <span
          className={
            driver.safetyScore < LOW_SAFETY_SCORE
              ? "font-mono text-xs text-status-shop"
              : "font-mono text-xs text-muted"
          }
        >
          {driver.safetyScore}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (driver) => {
        const meta = DRIVER_STATUS_META[driver.status];
        return <StatusBadge label={meta.label} color={meta.color} />;
      },
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            className: "text-right",
            cell: (driver: Driver) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${driver.name}`}
                  onClick={() => openEdit(driver)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${driver.name}`}
                  onClick={() => setPendingDelete(driver)}
                >
                  <Trash2 className="h-4 w-4 text-status-suspended" />
                </Button>
              </div>
            ),
          } satisfies Column<Driver>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fleet / drivers"
        title="Driver management"
        description="Licence validity, safety score and current assignment eligibility. A suspended driver, or one whose licence has expired, cannot be assigned to a trip."
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add driver
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
              rows={drivers}
              getRowId={(driver) => driver.id}
              isLoading={isPending}
              emptyMessage="No drivers registered yet."
            />
          )}
        </CardContent>
      </Card>

      <DriverFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        driver={editing}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            deleteDriver.reset();
          }
        }}
        title="Delete driver"
        description={`Permanently delete ${
          pendingDelete?.name ?? "this driver"
        }. A driver with trip history cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        isPending={deleteDriver.isPending}
        error={deleteDriver.error}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
