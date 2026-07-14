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
import { useCreateFuelLog, useUpdateFuelLog } from "@/lib/queries/expenses";
import { useVehicles } from "@/lib/queries/vehicles";
import { applyServerFieldErrors } from "@/lib/form";
import { toDateInputValue } from "@/lib/format";
import type { FuelLog } from "@/lib/types";

const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, "Select a vehicle"),
  liters: z
    .number({ error: "Litres are required" })
    .positive("Litres must be greater than 0"),
  cost: z.number({ error: "Cost is required" }).min(0, "Cost cannot be negative"),
  date: z.string().min(1, "Date is required"),
});

type FuelLogFormValues = z.infer<typeof fuelLogSchema>;

const FORM_FIELDS = ["vehicleId", "liters", "cost", "date"] as const;

interface FuelLogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create; pass a log to edit it. */
  fuelLog?: FuelLog;
}

export function FuelLogFormDialog({
  open,
  onOpenChange,
  fuelLog,
}: FuelLogFormDialogProps) {
  const isEditing = fuelLog !== undefined;

  const createFuelLog = useCreateFuelLog();
  const updateFuelLog = useUpdateFuelLog();
  const mutation = isEditing ? updateFuelLog : createFuelLog;

  const { data: vehicles = [], isPending: vehiclesPending } = useVehicles();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FuelLogFormValues>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      vehicleId: "",
      liters: 0,
      cost: 0,
      date: toDateInputValue(new Date()),
    },
  });

  useEffect(() => {
    if (!open) return;

    reset(
      fuelLog
        ? {
            vehicleId: fuelLog.vehicleId,
            liters: fuelLog.liters,
            cost: fuelLog.cost,
            date: fuelLog.date,
          }
        : {
            vehicleId: "",
            liters: 0,
            cost: 0,
            date: toDateInputValue(new Date()),
          }
    );
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fuelLog, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateFuelLog.mutateAsync({ id: fuelLog.id, ...values });
        toast.success("Fuel log updated");
      } else {
        await createFuelLog.mutateAsync(values);
        toast.success("Fuel log recorded");
      }
      onOpenChange(false);
    } catch (error) {
      applyServerFieldErrors(error, setError, FORM_FIELDS);
    }
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit fuel log" : "Add fuel log"}
      description="Fuel cost feeds operational cost and the per-vehicle efficiency figures."
      submitLabel={isEditing ? "Save changes" : "Add fuel log"}
      isSubmitting={mutation.isPending}
      error={mutation.error}
      onSubmit={onSubmit}
    >
      <Field label="Vehicle" required error={errors.vehicleId?.message}>
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

      <Field label="Date" required error={errors.date?.message}>
        <Input type="date" {...register("date")} />
      </Field>

      <Field label="Litres" required error={errors.liters?.message}>
        <Input
          type="number"
          min={0}
          step="any"
          {...register("liters", { valueAsNumber: true })}
        />
      </Field>

      <Field label="Cost" required error={errors.cost?.message}>
        <Input
          type="number"
          min={0}
          step="any"
          {...register("cost", { valueAsNumber: true })}
        />
      </Field>
    </FormDialog>
  );
}
