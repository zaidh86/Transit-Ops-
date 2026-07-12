import { z } from "zod";
import { VehicleStatus, VehicleType } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";

// ON_TRIP is owned by trip dispatch (Module 6) and can never be set manually.
const manualStatus = z
  .nativeEnum(VehicleStatus, {
    errorMap: () => ({
      message: "Status must be one of: AVAILABLE, IN_SHOP, RETIRED",
    }),
  })
  .refine((s) => s !== "ON_TRIP", {
    message: "ON_TRIP is set automatically when a trip is dispatched",
  });

export const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(2, "Registration number must be at least 2 characters"),
  name: z.string().trim().min(2, "Vehicle name must be at least 2 characters"),
  type: z.nativeEnum(VehicleType, {
    errorMap: () => ({
      message: "Type must be one of: TRUCK, VAN, TRAILER, BIKE",
    }),
  }),
  maxLoadCapacity: z
    .number()
    .positive("Max load capacity must be greater than 0"),
  odometer: z.number().min(0, "Odometer cannot be negative").optional(),
  acquisitionCost: z
    .number()
    .positive("Acquisition cost must be greater than 0"),
  region: z.string().trim().min(1).optional(),
  status: manualStatus.optional(),
});

export const updateVehicleSchema = z
  .object({
    registrationNumber: z
      .string()
      .trim()
      .min(2, "Registration number must be at least 2 characters")
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, "Vehicle name must be at least 2 characters")
      .optional(),
    type: z
      .nativeEnum(VehicleType, {
        errorMap: () => ({
          message: "Type must be one of: TRUCK, VAN, TRAILER, BIKE",
        }),
      })
      .optional(),
    maxLoadCapacity: z
      .number()
      .positive("Max load capacity must be greater than 0")
      .optional(),
    odometer: z.number().min(0, "Odometer cannot be negative").optional(),
    acquisitionCost: z
      .number()
      .positive("Acquisition cost must be greater than 0")
      .optional(),
    region: z.string().trim().min(1).nullable().optional(),
    status: manualStatus.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const vehicleListQuerySchema = z.object({
  type: z.nativeEnum(VehicleType).optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  region: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleListFilters = z.infer<typeof vehicleListQuerySchema>;

/**
 * Query-string validation (the validate middleware covers bodies only).
 * Invalid filter values return an explicit 400 instead of silently
 * returning unfiltered data — better DX for the frontend.
 */
export function parseVehicleListQuery(query: unknown): VehicleListFilters {
  const result = vehicleListQuerySchema.safeParse(query);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "query",
      message: issue.message,
    }));
    throw ApiError.badRequest("Invalid query parameters", details);
  }
  return result.data;
}