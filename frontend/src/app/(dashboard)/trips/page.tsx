"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Plus, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/feature/page-header";
import { StatGrid } from "@/components/feature/stat-grid";
import { TripFormDialog } from "@/components/feature/trips/trip-form-dialog";
import { CompleteTripDialog } from "@/components/feature/trips/complete-trip-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/states";
import { useAuth } from "@/lib/auth-context";
import { useCancelTrip, useDispatchTrip, useTrips } from "@/lib/queries/trips";
import { TRIP_STATUS_META } from "@/lib/constants";
import { formatCurrency, formatKilograms, formatKilometres } from "@/lib/format";
import type { Trip, TripStatus } from "@/lib/types";

const ALL = "ALL";

const TRIP_STATUSES: readonly TripStatus[] = [
  "DRAFT",
  "DISPATCHED",
  "COMPLETED",
  "CANCELLED",
];

export default function TripsPage() {
  const { hasRole } = useAuth();
  // The backend allows both the dispatcher persona and the fleet manager to
  // move a trip through its lifecycle.
  const canOperate = hasRole("DRIVER", "FLEET_MANAGER");

  const [status, setStatus] = useState<TripStatus | typeof ALL>(ALL);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completing, setCompleting] = useState<Trip | null>(null);
  const [dispatching, setDispatching] = useState<Trip | null>(null);
  const [cancelling, setCancelling] = useState<Trip | null>(null);

  const filters = useMemo(
    () => ({ status: status === ALL ? undefined : status }),
    [status]
  );

  const { data: trips = [], isPending, isError, error, refetch } =
    useTrips(filters);

  const dispatchTrip = useDispatchTrip();
  const cancelTrip = useCancelTrip();

  const stats = useMemo(
    () => [
      {
        label: "Draft",
        value: String(trips.filter((trip) => trip.status === "DRAFT").length),
      },
      {
        label: "Dispatched",
        value: String(
          trips.filter((trip) => trip.status === "DISPATCHED").length
        ),
      },
      {
        label: "Completed",
        value: String(
          trips.filter((trip) => trip.status === "COMPLETED").length
        ),
      },
      {
        label: "Cancelled",
        value: String(
          trips.filter((trip) => trip.status === "CANCELLED").length
        ),
      },
    ],
    [trips]
  );

  async function confirmDispatch(): Promise<void> {
    if (!dispatching) return;
    try {
      await dispatchTrip.mutateAsync(dispatching.id);
      toast.success(
        `Dispatched to ${dispatching.destination}. ${dispatching.vehicle.registrationNumber} and ${dispatching.driver.name} are now On Trip.`
      );
      setDispatching(null);
    } catch {
      // The 409 (vehicle or driver no longer available) stays on the dialog.
    }
  }

  async function confirmCancel(): Promise<void> {
    if (!cancelling) return;
    try {
      await cancelTrip.mutateAsync(cancelling.id);
      toast.success(`Trip to ${cancelling.destination} cancelled`);
      setCancelling(null);
    } catch {
      // Surfaced on the dialog.
    }
  }

  const columns: Column<Trip>[] = [
    {
      id: "route",
      header: "Route",
      cell: (trip) => (
        <div>
          <p className="text-foreground">
            {trip.source} → {trip.destination}
          </p>
          <p className="mt-0.5 text-xs text-muted-2 sm:hidden">
            {trip.vehicle.registrationNumber} · {trip.driver.name}
          </p>
        </div>
      ),
    },
    {
      id: "vehicle",
      header: "Vehicle",
      hideOnMobile: true,
      cell: (trip) => (
        <span className="font-mono text-xs text-foreground">
          {trip.vehicle.registrationNumber}
        </span>
      ),
    },
    {
      id: "driver",
      header: "Driver",
      hideOnMobile: true,
      cell: (trip) => <span className="text-muted">{trip.driver.name}</span>,
    },
    {
      id: "cargo",
      header: "Cargo",
      hideOnMobile: true,
      cell: (trip) => (
        <span className="text-muted">{formatKilograms(trip.cargoWeight)}</span>
      ),
    },
    {
      id: "distance",
      header: "Distance",
      hideOnMobile: true,
      cell: (trip) => (
        <span className="text-muted">
          {formatKilometres(trip.plannedDistance)}
        </span>
      ),
    },
    {
      id: "revenue",
      header: "Revenue",
      hideOnMobile: true,
      cell: (trip) => (
        <span className="text-muted">{formatCurrency(trip.revenue)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (trip) => {
        const meta = TRIP_STATUS_META[trip.status];
        return <StatusBadge label={meta.label} color={meta.color} />;
      },
    },
    ...(canOperate
      ? [
          {
            id: "actions",
            header: "",
            className: "text-right",
            cell: (trip: Trip) => (
              <div className="flex justify-end gap-1">
                {/* Only a Draft can be dispatched, and only a Dispatched trip
                    can be completed. Anything else is a 409, so we don't offer
                    the action at all. */}
                {trip.status === "DRAFT" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDispatching(trip)}
                  >
                    <Send className="h-4 w-4" />
                    Dispatch
                  </Button>
                )}

                {trip.status === "DISPATCHED" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompleting(trip)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Complete
                  </Button>
                )}

                {(trip.status === "DRAFT" || trip.status === "DISPATCHED") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Cancel trip to ${trip.destination}`}
                    onClick={() => setCancelling(trip)}
                  >
                    <XCircle className="h-4 w-4 text-status-suspended" />
                  </Button>
                )}
              </div>
            ),
          } satisfies Column<Trip>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations / trips"
        title="Trip management"
        description="Trips move from Draft to Dispatched to Completed. Dispatching puts the vehicle and driver On Trip; completing or cancelling returns them to Available."
        actions={
          canOperate ? (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create trip
            </Button>
          ) : undefined
        }
      />

      <StatGrid stats={stats} isLoading={isPending} />

      <Card>
        <CardContent className="space-y-4 p-4">
          <Select
            className="sm:w-48"
            aria-label="Filter by status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as TripStatus | typeof ALL)
            }
          >
            <option value={ALL}>All statuses</option>
            {TRIP_STATUSES.map((tripStatus) => (
              <option key={tripStatus} value={tripStatus}>
                {TRIP_STATUS_META[tripStatus].label}
              </option>
            ))}
          </Select>

          {isError ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : (
            <DataTable
              columns={columns}
              rows={trips}
              getRowId={(trip) => trip.id}
              isLoading={isPending}
              emptyMessage={
                status === ALL
                  ? "No trips yet."
                  : `No ${TRIP_STATUS_META[status].label.toLowerCase()} trips.`
              }
            />
          )}
        </CardContent>
      </Card>

      <TripFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <CompleteTripDialog
        open={completing !== null}
        onOpenChange={(open) => {
          if (!open) setCompleting(null);
        }}
        trip={completing}
      />

      <ConfirmDialog
        open={dispatching !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDispatching(null);
            dispatchTrip.reset();
          }
        }}
        title="Dispatch trip"
        description={
          dispatching
            ? `Dispatch ${dispatching.source} → ${dispatching.destination}. This puts ${dispatching.vehicle.registrationNumber} and ${dispatching.driver.name} On Trip until the trip is completed or cancelled.`
            : ""
        }
        confirmLabel="Dispatch"
        isPending={dispatchTrip.isPending}
        error={dispatchTrip.error}
        onConfirm={() => void confirmDispatch()}
      />

      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelling(null);
            cancelTrip.reset();
          }
        }}
        title="Cancel trip"
        description={
          cancelling
            ? cancelling.status === "DISPATCHED"
              ? `Cancel ${cancelling.source} → ${cancelling.destination}. ${cancelling.vehicle.registrationNumber} and ${cancelling.driver.name} will return to Available.`
              : `Cancel the draft trip ${cancelling.source} → ${cancelling.destination}.`
            : ""
        }
        confirmLabel="Cancel trip"
        destructive
        isPending={cancelTrip.isPending}
        error={cancelTrip.error}
        onConfirm={() => void confirmCancel()}
      />
    </div>
  );
}
