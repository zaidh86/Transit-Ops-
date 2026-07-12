import { z } from "zod";

export const maintenanceStatusSchema = z.enum(["OPEN", "CLOSED"]);

const maintenancePayloadSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  cost: z.coerce.number().min(0).default(0),
  status: maintenanceStatusSchema.default("OPEN"),
  closedAt: z.coerce.date().optional(),
});

export const createMaintenanceSchema = maintenancePayloadSchema;
export const updateMaintenanceSchema = maintenancePayloadSchema.partial();

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;