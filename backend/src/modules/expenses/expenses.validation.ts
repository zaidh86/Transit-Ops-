import { z } from "zod";

export const expenseTypeSchema = z.enum(["TOLL", "PARKING", "FINE", "OTHER"]);

const fuelLogPayloadSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional(),
  liters: z.coerce.number().positive("Liters must be greater than zero"),
  cost: z.coerce.number().min(0),
  date: z.coerce.date().default(() => new Date()),
});

const expensePayloadSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  type: expenseTypeSchema,
  amount: z.coerce.number().min(0),
  description: z.string().optional(),
  date: z.coerce.date().default(() => new Date()),
});

export const createFuelLogSchema = fuelLogPayloadSchema;
export const updateFuelLogSchema = fuelLogPayloadSchema.partial();
export const createExpenseSchema = expensePayloadSchema;
export const updateExpenseSchema = expensePayloadSchema.partial();

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;
export type UpdateFuelLogInput = z.infer<typeof updateFuelLogSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;