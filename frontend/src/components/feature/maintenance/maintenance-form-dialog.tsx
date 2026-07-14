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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateMaintenance,
  useUpdateMaintenance,
} from "@/lib/queries/maintenance";
import { useVehicles } from "@/lib/queries/vehicles";
import { applyServerFieldErrors } from "@/lib/form";
import type { MaintenanceLog } from "@/lib/types";

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Select a vehicle"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim(),
  cost: z
    .number({ error: "Cost is required" })
    .min(0, "Cost cannot be negative"),
  status: z.enum(["OPEN", "CLOSED"]),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

const FORM_FIELDS = [
  "vehicleId",
  "title",
  "description",
  "cost",
  "status",
] as const;

const EMPTY_LOG: MaintenanceFormValues = {
  vehicleId: "",
  title: "",
  description: "",
  cost: 0,
  status: "OPEN",
};

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create; pass a log to edit it. */
  log?: MaintenanceLog;
}

export function MaintenanceFormDialog({
  open,
  onOpenChange,
  log,
}: MaintenanceFormDialogProps) {
  const isEditing = log !== undefined;

  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const mutation = isEditing ? updateMaintenance : createMaintenance;

  // Any vehicle can have a service record, including one already in the shop.
  const { data: vehicles = [], isPending: vehiclesPending } = useVehicles();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: EMPTY_LOG,
  });

  useEffect(() => {
    if (!open) return;

    reset(
      log
        ? {
            vehicleId: log.vehicleId,
            // The DTO collapses title and description into one field, so the
            // only faithful thing to seed both from is what it gives us back.
            title: log.description,
            description: "",
            cost: log.cost,
            status: log.isActive ? "OPEN" : "CLOSED",
          }
        : EMPTY_LOG
    );
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, log, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      description: values.description === "" ? undefined : values.description,
    };

    try {
      if (isEditing) {
        await updateMaintenance.mutateAsync({ id: log.id, ...payload });
        toast.success(
          values.status === "CLOSED"
            ? "Maintenance closed. The vehicle returns to Available if nothing else is open."
            : "Maintenance log updated"
        );
      } else {
        await createMaintenance.mutateAsync(payload);
        toast.success(
          values.status === "OPEN"
            ? "Maintenance opened. The vehicle is now In Shop."
            : "Maintenance log recorded"
        );
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
      title={isEditing ? "Edit maintenance log" : "Create maintenance log"}
      description="An open log forces the vehicle In Shop and keeps it out of dispatch. Closing the last open log returns it to Available."
      submitLabel={isEditing ? "Save changes" : "Create log"}
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

      <Field label="Status" required error={errors.status?.message}>
        <Select {...register("status")}>
          <option value="OPEN">Open — vehicle goes In Shop</option>
          <option value="CLOSED">Closed — work finished</option>
        </Select>
      </Field>

      <Field label="Title" required error={errors.title?.message}>
        <Input
          placeholder="Oil change and inspection"
          {...register("title")}
        />
      </Field>

      <Field label="Cost" error={errors.cost?.message}>
        <Input
          type="number"
          min={0}
          step="any"
          {...register("cost", { valueAsNumber: true })}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field
          label="Description"
          hint="Optional"
          error={errors.description?.message}
        >
          <Textarea
            placeholder="Parts replaced, work performed…"
            {...register("description")}
          />
        </Field>
      </div>
    </FormDialog>
  );
}
