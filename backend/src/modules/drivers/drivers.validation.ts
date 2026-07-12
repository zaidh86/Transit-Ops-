import { z } from "zod";

export const driverStatusSchema = z.enum([
  "AVAILABLE",
  "ON_TRIP",
  "OFF_DUTY",
  "SUSPENDED",
]);

const driverPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiryDate: z.coerce.date(),
  contactNumber: z.string().min(1, "Contact number is required"),
  safetyScore: z.coerce.number().min(0).max(100).default(100),
  status: driverStatusSchema.default("AVAILABLE"),
});

export const createDriverSchema = driverPayloadSchema;
export const updateDriverSchema = driverPayloadSchema.partial();

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;