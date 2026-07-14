"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Field } from "@/components/forms/field";
import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreateTrip } from "@/lib/queries/trips";
import { useAssignableVehicles } from "@/lib/queries/vehicles";
import { useAssignableDrivers } from "@/lib/queries/drivers";
import { applyServerFieldErrors } from "@/lib/form";
import { formatKilograms } from "@/lib/format";

const tripSchema = z.object({
  source: z.string().trim().min(2, "Source must be at least 2 characters"),
  destination: z
    .string()
    .trim()
    .min(2, "Destination must be at least 2 characters"),
  vehicleId: z.string().min(1, "Select a vehicle"),
  driverId: z.string().min(1, "Select a driver"),
  cargoWeight: z
    .number({ error: "Cargo weight is required" })
    .positive("Cargo weight must be greater than 0"),
  plannedDistance: z
    .number({ error: "Planned distance is required" })
    .positive("Planned distance must be greater than 0"),
  revenue: z
    .number({ error: "Revenue is required" })
    .min(0, "Revenue cannot be negative"),
});

type TripFormValues = z.infer<typeof tripSchema>;

const FORM_FIELDS = [
  "source",
  "destination",
  "vehicleId",
  "driverId",
  "cargoWeight",
  "plannedDistance",
  "revenue",
] as const;

const EMPTY_TRIP: TripFormValues = {
  source: "",
  destination: "",
  vehicleId: "",
  driverId: "",
  cargoWeight: 0,
  plannedDistance: 0,
  revenue: 0,
};

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Creates a DRAFT trip. Trips are never edited as a whole — they move through
 * their lifecycle via dispatch/complete/cancel — so there is no edit mode here.
 */
export function TripFormDialog({ open, onOpenChange }: TripFormDialogProps) {
  const createTrip = useCreateTrip();

  // Only vehicles and drivers the backend would actually accept. Offering the
  // rest would just be a 409 waiting to happen.
  const { data: vehicles = [], isPending: vehiclesPending } =
    useAssignableVehicles();
  const { data: drivers = [], isPending: driversPending } =
    useAssignableDrivers();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: EMPTY_TRIP,
  });

  useEffect(() => {
    if (!open) return;
    reset(EMPTY_TRIP);
    createTrip.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  // useWatch rather than watch(): the latter returns a fresh function each
  // render, which opts the whole component out of React Compiler memoization.
  const selectedVehicleId = useWatch({ control, name: "vehicleId" });
  const cargoWeight = useWatch({ control, name: "cargoWeight" });

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId
  );

  // The backend rejects an overweight trip with a 409. Catching it here as well
  // means the operator finds out while they are still typing, not on submit.
  const isOverweight =
    selectedVehicle !== undefined &&
    Number.isFinite(cargoWeight) &&
    cargoWeight > selectedVehicle.maxLoadCapacity;

  const onSubmit = handleSubmit(async (values) => {
    if (isOverweight && selectedVehicle) {
      setError("cargoWeight", {
        type: "validate",
        message: `Exceeds the vehicle's capacity of ${formatKilograms(
          selectedVehicle.maxLoadCapacity
        )}`,
      });
      return;
    }

    try {
      const trip = await createTrip.mutateAsync(values);
      toast.success(`Draft trip to ${trip.destination} created`);
      onOpenChange(false);
    } catch (error) {
      applyServerFieldErrors(error, setError, FORM_FIELDS);
    }
  });

  const noneAssignable =
    !vehiclesPending &&
    !driversPending &&
    (vehicles.length === 0 || drivers.length === 0);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create trip"
      description="A new trip starts as a Draft. Vehicle and driver statuses only change when it is dispatched."
      submitLabel="Create trip"
      isSubmitting={createTrip.isPending}
      error={createTrip.error}
      onSubmit={onSubmit}
    >
      {noneAssignable && (
        <p className="sm:col-span-2 rounded-md border border-status-shop/40 bg-status-shop/10 px-3 py-2 text-sm text-status-shop">
          {vehicles.length === 0
            ? "No vehicle is currently available. Free one up by completing a trip or closing its maintenance."
            : "No driver is currently available with a valid licence."}
        </p>
      )}

      <Field label="Source" required error={errors.source?.message}>
        <Input placeholder="Hyderabad" {...register("source")} />
      </Field>

      <Field label="Destination" required error={errors.destination?.message}>
        <Input placeholder="Warangal" {...register("destination")} />
      </Field>

      <Field
        label="Vehicle"
        required
        hint={
          selectedVehicle
            ? `Capacity ${formatKilograms(selectedVehicle.maxLoadCapacity)}`
            : "Only Available vehicles are listed."
        }
        error={errors.vehicleId?.message}
      >
        <Select {...register("vehicleId")} disabled={vehiclesPending}>
          <option value="">
            {vehiclesPending ? "Loading…" : "Select a vehicle"}
          </option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.registrationNumber} — {vehicle.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Driver"
        required
        hint="Only available drivers with a valid licence are listed."
        error={errors.driverId?.message}
      >
        <Select {...register("driverId")} disabled={driversPending}>
          <option value="">
            {driversPending ? "Loading…" : "Select a driver"}
          </option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name} — {driver.licenseNumber}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Cargo weight (kg)"
        required
        error={
          errors.cargoWeight?.message ??
          (isOverweight && selectedVehicle
            ? `Exceeds the vehicle's capacity of ${formatKilograms(
                selectedVehicle.maxLoadCapacity
              )}`
            : undefined)
        }
      >
        <Input
          type="number"
          min={0}
          step="any"
          {...register("cargoWeight", { valueAsNumber: true })}
        />
      </Field>

      <Field
        label="Planned distance (km)"
        required
        error={errors.plannedDistance?.message}
      >
        <Input
          type="number"
          min={0}
          step="any"
          {...register("plannedDistance", { valueAsNumber: true })}
        />
      </Field>

      <Field
        label="Revenue"
        hint="Used to calculate vehicle ROI."
        error={errors.revenue?.message}
      >
        <Input
          type="number"
          min={0}
          step="any"
          {...register("revenue", { valueAsNumber: true })}
        />
      </Field>
    </FormDialog>
  );
}
