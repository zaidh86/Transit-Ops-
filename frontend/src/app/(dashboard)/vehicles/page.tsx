"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/feature/page-header";
import { StatGrid } from "@/components/feature/stat-grid";
import { VehicleFormDialog } from "@/components/feature/vehicles/vehicle-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/states";
import { useAuth } from "@/lib/auth-context";
import { useDeleteVehicle, useVehicles } from "@/lib/queries/vehicles";
import { VEHICLE_STATUS_META, VEHICLE_TYPE_LABELS } from "@/lib/constants";
import {
  formatCurrency,
  formatKilograms,
  formatKilometres,
} from "@/lib/format";
import {
  VEHICLE_TYPES,
  type Vehicle,
  type VehicleStatus,
  type VehicleType,
} from "@/lib/types";

const ALL = "ALL";

const VEHICLE_STATUSES: readonly VehicleStatus[] = [
  "AVAILABLE",
  "ON_TRIP",
  "IN_SHOP",
  "RETIRED",
];

export default function VehiclesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("FLEET_MANAGER");

  const [search, setSearch] = useState("");
  const [type, setType] = useState<VehicleType | typeof ALL>(ALL);
  const [status, setStatus] = useState<VehicleStatus | typeof ALL>(ALL);

  const [editing, setEditing] = useState<Vehicle | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);

  // The backend owns the filtering, so the filters live in the query key: a
  // change refetches rather than whittling down a stale local array.
  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      type: type === ALL ? undefined : type,
      status: status === ALL ? undefined : status,
    }),
    [search, type, status]
  );

  const {
    data: vehicles = [],
    isPending,
    isError,
    error,
    refetch,
  } = useVehicles(filters);

  const deleteVehicle = useDeleteVehicle();

  const stats = useMemo(
    () => [
      { label: "Matching vehicles", value: String(vehicles.length) },
      {
        label: "Available",
        value: String(
          vehicles.filter((vehicle) => vehicle.status === "AVAILABLE").length
        ),
      },
      {
        label: "On trip",
        value: String(
          vehicles.filter((vehicle) => vehicle.status === "ON_TRIP").length
        ),
      },
      {
        label: "In shop",
        value: String(
          vehicles.filter((vehicle) => vehicle.status === "IN_SHOP").length
        ),
      },
    ],
    [vehicles]
  );

  function openCreate(): void {
    setEditing(undefined);
    setIsFormOpen(true);
  }

  function openEdit(vehicle: Vehicle): void {
    setEditing(vehicle);
    setIsFormOpen(true);
  }

  async function confirmDelete(): Promise<void> {
    if (!pendingDelete) return;
    try {
      await deleteVehicle.mutateAsync(pendingDelete.id);
      toast.success(`${pendingDelete.registrationNumber} deleted`);
      setPendingDelete(null);
    } catch {
      // The 409 ("vehicle has operational history — retire it instead") stays
      // on the dialog, where the user can actually act on it.
    }
  }

  const columns: Column<Vehicle>[] = [
    {
      id: "registration",
      header: "Registration",
      cell: (vehicle) => (
        <span className="font-mono text-xs text-foreground">
          {vehicle.registrationNumber}
        </span>
      ),
    },
    {
      id: "name",
      header: "Name",
      cell: (vehicle) => <span className="text-foreground">{vehicle.name}</span>,
    },
    {
      id: "type",
      header: "Type",
      hideOnMobile: true,
      cell: (vehicle) => (
        <span className="text-muted">{VEHICLE_TYPE_LABELS[vehicle.type]}</span>
      ),
    },
    {
      id: "capacity",
      header: "Capacity",
      hideOnMobile: true,
      cell: (vehicle) => (
        <span className="text-muted">
          {formatKilograms(vehicle.maxLoadCapacity)}
        </span>
      ),
    },
    {
      id: "odometer",
      header: "Odometer",
      hideOnMobile: true,
      cell: (vehicle) => (
        <span className="text-muted">{formatKilometres(vehicle.odometer)}</span>
      ),
    },
    {
      id: "cost",
      header: "Acquisition",
      hideOnMobile: true,
      cell: (vehicle) => (
        <span className="text-muted">
          {formatCurrency(vehicle.acquisitionCost)}
        </span>
      ),
    },
    {
      id: "region",
      header: "Region",
      hideOnMobile: true,
      cell: (vehicle) => (
        <span className="text-muted">{vehicle.region ?? "—"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (vehicle) => {
        const meta = VEHICLE_STATUS_META[vehicle.status];
        return <StatusBadge label={meta.label} color={meta.color} />;
      },
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            className: "text-right",
            cell: (vehicle: Vehicle) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${vehicle.registrationNumber}`}
                  onClick={() => openEdit(vehicle)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${vehicle.registrationNumber}`}
                  onClick={() => setPendingDelete(vehicle)}
                >
                  <Trash2 className="h-4 w-4 text-status-suspended" />
                </Button>
              </div>
            ),
          } satisfies Column<Vehicle>,
        ]
      : []),
  ];

  const hasFilters = search !== "" || type !== ALL || status !== ALL;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fleet / vehicles"
        title="Vehicle registry"
        description="Vehicle identity, load capacity, odometer, acquisition cost and current state. Only Available vehicles can be assigned to a trip."
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add vehicle
            </Button>
          ) : undefined
        }
      />

      <StatGrid stats={stats} isLoading={isPending} />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
                aria-hidden
              />
              <Input
                className="pl-9"
                placeholder="Search registration or name…"
                aria-label="Search vehicles"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Select
              className="sm:w-40"
              aria-label="Filter by type"
              value={type}
              onChange={(event) =>
                setType(event.target.value as VehicleType | typeof ALL)
              }
            >
              <option value={ALL}>All types</option>
              {VEHICLE_TYPES.map((vehicleType) => (
                <option key={vehicleType} value={vehicleType}>
                  {VEHICLE_TYPE_LABELS[vehicleType]}
                </option>
              ))}
            </Select>

            <Select
              className="sm:w-40"
              aria-label="Filter by status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as VehicleStatus | typeof ALL)
              }
            >
              <option value={ALL}>All statuses</option>
              {VEHICLE_STATUSES.map((vehicleStatus) => (
                <option key={vehicleStatus} value={vehicleStatus}>
                  {VEHICLE_STATUS_META[vehicleStatus].label}
                </option>
              ))}
            </Select>
          </div>

          {isError ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : (
            <DataTable
              columns={columns}
              rows={vehicles}
              getRowId={(vehicle) => vehicle.id}
              isLoading={isPending}
              emptyMessage={
                hasFilters
                  ? "No vehicles match these filters."
                  : "No vehicles registered yet."
              }
            />
          )}
        </CardContent>
      </Card>

      <VehicleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        vehicle={editing}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            deleteVehicle.reset();
          }
        }}
        title="Delete vehicle"
        description={`Permanently delete ${
          pendingDelete?.registrationNumber ?? "this vehicle"
        }. A vehicle with trip, maintenance, fuel or expense history cannot be deleted — retire it instead.`}
        confirmLabel="Delete"
        destructive
        isPending={deleteVehicle.isPending}
        error={deleteVehicle.error}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
