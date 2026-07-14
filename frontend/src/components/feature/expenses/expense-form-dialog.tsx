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
import { useCreateExpense, useUpdateExpense } from "@/lib/queries/expenses";
import { useVehicles } from "@/lib/queries/vehicles";
import { applyServerFieldErrors } from "@/lib/form";
import { EXPENSE_TYPE_LABELS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";
import { EXPENSE_TYPES, type Expense } from "@/lib/types";

const expenseSchema = z.object({
  vehicleId: z.string().min(1, "Select a vehicle"),
  type: z.enum(EXPENSE_TYPES),
  amount: z
    .number({ error: "Amount is required" })
    .min(0, "Amount cannot be negative"),
  description: z.string().trim(),
  date: z.string().min(1, "Date is required"),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const FORM_FIELDS = [
  "vehicleId",
  "type",
  "amount",
  "description",
  "date",
] as const;

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create; pass an expense to edit it. */
  expense?: Expense;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) {
  const isEditing = expense !== undefined;

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const mutation = isEditing ? updateExpense : createExpense;

  const { data: vehicles = [], isPending: vehiclesPending } = useVehicles();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      vehicleId: "",
      type: "TOLL",
      amount: 0,
      description: "",
      date: toDateInputValue(new Date()),
    },
  });

  useEffect(() => {
    if (!open) return;

    reset(
      expense
        ? {
            vehicleId: expense.vehicleId,
            // The DTO renames `type` to `category` and `description` to `notes`
            // on the way out; the write endpoints still take the original names.
            type: expense.category,
            amount: expense.amount,
            description: expense.notes ?? "",
            date: expense.date,
          }
        : {
            vehicleId: "",
            type: "TOLL",
            amount: 0,
            description: "",
            date: toDateInputValue(new Date()),
          }
    );
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      description: values.description === "" ? undefined : values.description,
    };

    try {
      if (isEditing) {
        await updateExpense.mutateAsync({ id: expense.id, ...payload });
        toast.success("Expense updated");
      } else {
        await createExpense.mutateAsync(payload);
        toast.success("Expense recorded");
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
      title={isEditing ? "Edit expense" : "Add expense"}
      description="Tolls, parking and fines are tracked per vehicle. They sit outside operational cost, which is fuel plus maintenance."
      submitLabel={isEditing ? "Save changes" : "Add expense"}
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

      <Field label="Category" required error={errors.type?.message}>
        <Select {...register("type")}>
          {EXPENSE_TYPES.map((type) => (
            <option key={type} value={type}>
              {EXPENSE_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Amount" required error={errors.amount?.message}>
        <Input
          type="number"
          min={0}
          step="any"
          {...register("amount", { valueAsNumber: true })}
        />
      </Field>

      <Field label="Date" required error={errors.date?.message}>
        <Input type="date" {...register("date")} />
      </Field>

      <div className="sm:col-span-2">
        <Field
          label="Notes"
          hint="Optional"
          error={errors.description?.message}
        >
          <Textarea
            placeholder="North corridor toll…"
            {...register("description")}
          />
        </Field>
      </div>
    </FormDialog>
  );
}
