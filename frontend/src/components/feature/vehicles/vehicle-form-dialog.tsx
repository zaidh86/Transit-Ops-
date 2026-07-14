"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Field } from "@/components/forms/field";
import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreateVehicle, useUpdateVehicle } from "@/lib/queries/vehicles";
import { applyServerFieldErrors } from "@/lib/form";
import {
  VEHICLE_STATUS_META,
  VEHICLE_TYPE_LABELS,
} from "@/lib/constants";
import {
  MANUAL_VEHICLE_STATUSES,
  VEHICLE_TYPES,
  type Vehicle,
} from "@/lib/types";

/**
 * Mirrors the backend's Zod schema. ON_TRIP is deliberately absent from the
 * status options: dispatch owns that transition and the API rejects it here.
 */
const vehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(2, "Registration number must be at least 2 characters"),
  name: z.string().trim().min(2, "Vehicle name must be at least 2 characters"),
  type: z.enum(VEHICLE_TYPES),
  maxLoadCapacity: z
    .number({ error: "Max load capacity is required" })
    .positive("Max load capacity must be greater than 0"),
  odometer: z
    .number({ error: "Odometer is required" })
    .min(0, "Odometer cannot be negative"),
  acquisitionCost: z
    .number({ error: "Acquisition cost is required" })
    .positive("Acquisition cost must be greater than 0"),
  region: z.string().trim(),
  status: z.enum(MANUAL_VEHICLE_STATUSES),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

const FORM_FIELDS = [
  "registrationNumber",
  "name",
  "type",
  "maxLoadCapacity",
  "odometer",
  "acquisitionCost",
  "region",
  "status",
] as const;

const EMPTY_VEHICLE: VehicleFormValues = {
  registrationNumber: "",
  name: "",
  type: "TRUCK",
  maxLoadCapacity: 0,
  odometer: 0,
  acquisitionCost: 0,
  region: "",
  status: "AVAILABLE",
};

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create; pass a vehicle to edit it. */
  vehicle?: Vehicle;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
}: VehicleFormDialogProps) {
  const isEditing = vehicle !== undefined;

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const mutation = isEditing ? updateVehicle : createVehicle;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: EMPTY_VEHICLE,
  });

  // Reset on open so a reused dialog never shows the previous record's values.
  useEffect(() => {
    if (!open) return;

    reset(
      vehicle
        ? {
            registrationNumber: vehicle.registrationNumber,
            name: vehicle.name,
            type: vehicle.type,
            maxLoadCapacity: vehicle.maxLoadCapacity,
            odometer: vehicle.odometer,
            acquisitionCost: vehicle.acquisitionCost,
            region: vehicle.region ?? "",
            // A vehicle that is ON_TRIP cannot be edited to another status by
            // hand, so fall back to a value the form is allowed to submit.
            status: vehicle.status === "ON_TRIP" ? "AVAILABLE" : vehicle.status,
          }
        : EMPTY_VEHICLE
    );
    mutation.reset();
    // `mutation` is recreated each render; depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      // The backend treats an absent region as "unset"; an empty string is not
      // a valid region.
      region: values.region === "" ? undefined : values.region,
    };

    try {
      if (isEditing) {
        await updateVehicle.mutateAsync({ id: vehicle.id, ...payload });
        toast.success(`${values.registrationNumber} updated`);
      } else {
        await createVehicle.mutateAsync(payload);
        toast.success(`${values.registrationNumber} added to the fleet`);
      }
      onOpenChange(false);
    } catch (error) {
      // A 400 lands on the offending inputs; anything else (a 409 duplicate
      // registration number, say) is shown in the dialog's banner.
      applyServerFieldErrors(error, setError, FORM_FIELDS);
    }
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit vehicle" : "Add vehicle"}
      description={
        isEditing
          ? "Update this vehicle's registry details."
          : "Register a vehicle so it can be assigned to trips."
      }
      submitLabel={isEditing ? "Save changes" : "Add vehicle"}
      isSubmitting={mutation.isPending}
      error={mutation.error}
      onSubmit={onSubmit}
    >
      <Field
        label="Registration number"
        required
        error={errors.registrationNumber?.message}
      >
        <Input placeholder="Van-05" {...register("registrationNumber")} />
      </Field>

      <Field label="Name" required error={errors.name?.message}>
        <Input placeholder="Tata Ace Van" {...register("name")} />
      </Field>

      <Field label="Type" required error={errors.type?.message}>
        <Select {...register("type")}>
          {VEHICLE_TYPES.map((type) => (
            <option key={type} value={type}>
              {VEHICLE_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Status" required error={errors.status?.message}>
        <Select {...register("status")}>
          {MANUAL_VEHICLE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {VEHICLE_STATUS_META[status].label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Max load capacity (kg)"
        required
        error={errors.maxLoadCapacity?.message}
      >
        <Input
          type="number"
          min={0}
          step="any"
          {...register("maxLoadCapacity", { valueAsNumber: true })}
        />
      </Field>

      <Field label="Odometer (km)" error={errors.odometer?.message}>
        <Input
          type="number"
          min={0}
          step="any"
          {...register("odometer", { valueAsNumber: true })}
        />
      </Field>

      <Field
        label="Acquisition cost"
        required
        error={errors.acquisitionCost?.message}
      >
        <Input
          type="number"
          min={0}
          step="any"
          {...register("acquisitionCost", { valueAsNumber: true })}
        />
      </Field>

      <Field
        label="Region"
        hint="Optional"
        error={errors.region?.message}
      >
        <Input placeholder="Hyderabad" {...register("region")} />
      </Field>
    </FormDialog>
  );
}
