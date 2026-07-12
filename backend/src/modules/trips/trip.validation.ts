import { z } from "zod";
import { TripStatus } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";

export const createTripSchema = z.object({
  source: z.string().trim().min(2, "Source must be at least 2 characters"),
  destination: z
    .string()
    .trim()
    .min(2, "Destination must be at least 2 characters"),
  vehicleId: z.string().trim().min(1, "Vehicle id is required"),
  driverId: z.string().trim().min(1, "Driver id is required"),
  cargoWeight: z.number().positive("Cargo weight must be greater than 0"),
  plannedDistance: z
    .number()
    .positive("Planned distance must be greater than 0"),
  revenue: z.number().min(0, "Revenue cannot be negative").optional(),
});

export const completeTripSchema = z.object({
  endOdometer: z.number().positive("End odometer must be greater than 0"),
  fuelConsumed: z.number().positive("Fuel consumed must be greater than 0"),
  revenue: z.number().min(0, "Revenue cannot be negative").optional(),
});

export const tripListQuerySchema = z.object({
  status: z.nativeEnum(TripStatus).optional(),
  driverId: z.string().trim().min(1).optional(),
  vehicleId: z.string().trim().min(1).optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;
export type TripListFilters = z.infer<typeof tripListQuerySchema>;

/**
 * Query-string validation (the validate middleware covers bodies only).
 * Invalid filter values return an explicit 400 instead of silently
 * returning unfiltered data — same pattern as the vehicles module.
 */
export function parseTripListQuery(query: unknown): TripListFilters {
  const result = tripListQuerySchema.safeParse(query);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "query",
      message: issue.message,
    }));
    throw ApiError.badRequest("Invalid query parameters", details);
  }
  return result.data;
}