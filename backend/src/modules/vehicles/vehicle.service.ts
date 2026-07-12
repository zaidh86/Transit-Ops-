import { Prisma, Vehicle } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleListFilters,
} from "./vehicle.validation";

export async function createVehicle(
  input: CreateVehicleInput
): Promise<Vehicle> {
  // Duplicate registrationNumber throws Prisma P2002 → errorHandler maps to 409.
  return prisma.vehicle.create({ data: input });
}

export async function listVehicles(
  filters: VehicleListFilters
): Promise<Vehicle[]> {
  const where: Prisma.VehicleWhereInput = {};

  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.region) {
    where.region = { equals: filters.region, mode: "insensitive" };
  }
  if (filters.search) {
    where.OR = [
      { registrationNumber: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.vehicle.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    throw ApiError.notFound("Vehicle not found");
  }
  return vehicle;
}

export async function updateVehicle(
  id: string,
  input: UpdateVehicleInput
): Promise<Vehicle> {
  const vehicle = await getVehicleById(id); // throws 404 if missing

  // Status-integrity guards: manual edits must not corrupt automated state.
  if (input.status && input.status !== vehicle.status) {
    if (vehicle.status === "ON_TRIP") {
      throw ApiError.conflict(
        "Vehicle is currently On Trip. Complete or cancel the active trip before changing its status."
      );
    }
    if (input.status === "AVAILABLE") {
      const openMaintenance = await prisma.maintenanceLog.count({
        where: { vehicleId: id, status: "OPEN" },
      });
      if (openMaintenance > 0) {
        throw ApiError.conflict(
          "Vehicle has an open maintenance record. Close the maintenance record to restore the vehicle to Available."
        );
      }
    }
  }

  return prisma.vehicle.update({ where: { id }, data: input });
}

export async function deleteVehicle(id: string): Promise<void> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          trips: true,
          maintenanceLogs: true,
          fuelLogs: true,
          expenses: true,
        },
      },
    },
  });
  if (!vehicle) {
    throw ApiError.notFound("Vehicle not found");
  }

  const { trips, maintenanceLogs, fuelLogs, expenses } = vehicle._count;
  if (trips + maintenanceLogs + fuelLogs + expenses > 0) {
    throw ApiError.conflict(
      "Vehicle has operational history (trips, maintenance, fuel or expense records) and cannot be deleted. Set its status to RETIRED instead."
    );
  }

  await prisma.vehicle.delete({ where: { id } });
}