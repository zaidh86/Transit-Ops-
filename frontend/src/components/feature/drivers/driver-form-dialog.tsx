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
import { useCreateDriver, useUpdateDriver } from "@/lib/queries/drivers";
import { applyServerFieldErrors } from "@/lib/form";
import { DRIVER_STATUS_META } from "@/lib/constants";
import { DRIVER_STATUSES, type Driver } from "@/lib/types";

const driverSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  licenseNumber: z.string().trim().min(1, "License number is required"),
  licenseCategory: z.string().trim().min(1, "License category is required"),
  licenseExpiryDate: z
    .string()
    .min(1, "License expiry is required")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Enter a valid date"
    ),
  contactNumber: z.string().trim().min(1, "Contact number is required"),
  safetyScore: z
    .number({ error: "Safety score is required" })
    .min(0, "Safety score cannot be below 0")
    .max(100, "Safety score cannot exceed 100"),
  status: z.enum(DRIVER_STATUSES),
});

type DriverFormValues = z.infer<typeof driverSchema>;

const FORM_FIELDS = [
  "name",
  "licenseNumber",
  "licenseCategory",
  "licenseExpiryDate",
  "contactNumber",
  "safetyScore",
  "status",
] as const;

const EMPTY_DRIVER: DriverFormValues = {
  name: "",
  licenseNumber: "",
  licenseCategory: "",
  licenseExpiryDate: "",
  contactNumber: "",
  safetyScore: 100,
  status: "AVAILABLE",
};

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create; pass a driver to edit them. */
  driver?: Driver;
}

export function DriverFormDialog({
  open,
  onOpenChange,
  driver,
}: DriverFormDialogProps) {
  const isEditing = driver !== undefined;

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const mutation = isEditing ? updateDriver : createDriver;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: EMPTY_DRIVER,
  });

  useEffect(() => {
    if (!open) return;

    reset(
      driver
        ? {
            name: driver.name,
            licenseNumber: driver.licenseNumber,
            licenseCategory: driver.licenseCategory,
            licenseExpiryDate: driver.licenseExpiryDate,
            contactNumber: driver.contactNumber,
            safetyScore: driver.safetyScore,
            status: driver.status,
          }
        : EMPTY_DRIVER
    );
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, driver, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateDriver.mutateAsync({ id: driver.id, ...values });
        toast.success(`${values.name} updated`);
      } else {
        await createDriver.mutateAsync(values);
        toast.success(`${values.name} added`);
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
      title={isEditing ? "Edit driver" : "Add driver"}
      description={
        isEditing
          ? "Update this driver's licence and status."
          : "Register a driver. Trips can only be assigned to available drivers holding a valid licence."
      }
      submitLabel={isEditing ? "Save changes" : "Add driver"}
      isSubmitting={mutation.isPending}
      error={mutation.error}
      onSubmit={onSubmit}
    >
      <Field label="Name" required error={errors.name?.message}>
        <Input placeholder="Alex Morgan" {...register("name")} />
      </Field>

      <Field
        label="Contact number"
        required
        error={errors.contactNumber?.message}
      >
        <Input placeholder="+1-555-0104" {...register("contactNumber")} />
      </Field>

      <Field
        label="License number"
        required
        error={errors.licenseNumber?.message}
      >
        <Input placeholder="DL-10458" {...register("licenseNumber")} />
      </Field>

      <Field
        label="License category"
        required
        error={errors.licenseCategory?.message}
      >
        <Input placeholder="C1" {...register("licenseCategory")} />
      </Field>

      <Field
        label="License expiry"
        required
        hint="An expired licence blocks trip assignment."
        error={errors.licenseExpiryDate?.message}
      >
        <Input type="date" {...register("licenseExpiryDate")} />
      </Field>

      <Field
        label="Safety score"
        hint="0–100"
        error={errors.safetyScore?.message}
      >
        <Input
          type="number"
          min={0}
          max={100}
          step="any"
          {...register("safetyScore", { valueAsNumber: true })}
        />
      </Field>

      <Field label="Status" required error={errors.status?.message}>
        <Select {...register("status")}>
          {DRIVER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {DRIVER_STATUS_META[status].label}
            </option>
          ))}
        </Select>
      </Field>
    </FormDialog>
  );
}
