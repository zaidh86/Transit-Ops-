"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Field } from "@/components/forms/field";
import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { useCompleteTrip } from "@/lib/queries/trips";
import { applyServerFieldErrors } from "@/lib/form";
import { formatKilometres } from "@/lib/format";
import type { Trip } from "@/lib/types";

const completeTripSchema = z.object({
  endOdometer: z
    .number({ error: "End odometer is required" })
    .positive("End odometer must be greater than 0"),
  fuelConsumed: z
    .number({ error: "Fuel consumed is required" })
    .positive("Fuel consumed must be greater than 0"),
  revenue: z
    .number({ error: "Revenue is required" })
    .min(0, "Revenue cannot be negative"),
});

type CompleteTripFormValues = z.infer<typeof completeTripSchema>;

const FORM_FIELDS = ["endOdometer", "fuelConsumed", "revenue"] as const;

interface CompleteTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
}

/**
 * Closing readings for a dispatched trip. Completing it writes the odometer
 * back to the vehicle and returns both the vehicle and the driver to Available.
 */
export function CompleteTripDialog({
  open,
  onOpenChange,
  trip,
}: CompleteTripDialogProps) {
  const completeTrip = useCompleteTrip();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CompleteTripFormValues>({
    resolver: zodResolver(completeTripSchema),
    defaultValues: { endOdometer: 0, fuelConsumed: 0, revenue: 0 },
  });

  useEffect(() => {
    if (!open || !trip) return;

    reset({
      // Seed with the reading taken at dispatch: the final odometer can only be
      // higher, so this is the floor and a sensible starting point.
      endOdometer: trip.startOdometer ?? trip.vehicle.odometer,
      fuelConsumed: 0,
      revenue: trip.revenue,
    });
    completeTrip.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, trip, reset]);

  const startOdometer = trip?.startOdometer ?? null;

  const onSubmit = handleSubmit(async (values) => {
    if (!trip) return;

    // The backend returns a 400 for this; catching it here keeps the operator
    // from losing the rest of their input to a round trip.
    if (startOdometer !== null && values.endOdometer < startOdometer) {
      setError("endOdometer", {
        type: "validate",
        message: `Cannot be lower than the odometer at dispatch (${formatKilometres(
          startOdometer
        )})`,
      });
      return;
    }

    try {
      await completeTrip.mutateAsync({ id: trip.id, ...values });
      toast.success(`Trip to ${trip.destination} completed`);
      onOpenChange(false);
    } catch (error) {
      applyServerFieldErrors(error, setError, FORM_FIELDS);
    }
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Complete trip"
      description={
        trip
          ? `Record the closing readings for ${trip.source} → ${trip.destination}. This frees up ${trip.vehicle.registrationNumber} and ${trip.driver.name}.`
          : ""
      }
      submitLabel="Complete trip"
      isSubmitting={completeTrip.isPending}
      error={completeTrip.error}
      onSubmit={onSubmit}
    >
      <Field
        label="End odometer (km)"
        required
        hint={
          startOdometer !== null
            ? `At dispatch: ${formatKilometres(startOdometer)}`
            : undefined
        }
        error={errors.endOdometer?.message}
      >
        <Input
          type="number"
          min={0}
          step="any"
          {...register("endOdometer", { valueAsNumber: true })}
        />
      </Field>

      <Field
        label="Fuel consumed (L)"
        required
        error={errors.fuelConsumed?.message}
      >
        <Input
          type="number"
          min={0}
          step="any"
          {...register("fuelConsumed", { valueAsNumber: true })}
        />
      </Field>

      <Field
        label="Revenue"
        hint="Recorded against the vehicle's ROI."
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
