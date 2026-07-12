import { Driver, Prisma, Vehicle } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import {
  CompleteTripInput,
  CreateTripInput,
  TripListFilters,
} from "./trip.validation";

export type TripWithRelations = Prisma.TripGetPayload<{
  include: { vehicle: true; driver: true };
}>;

// ---------- Mandatory business-rule guards (spec section 4) ----------

function assertDriverAssignable(driver: Driver): void {
  if (driver.status === "SUSPENDED") {
    throw ApiError.conflict(
      "Driver is suspended and cannot be assigned to trips"
    );
  }
  if (driver.licenseExpiry < new Date()) {
    throw ApiError.conflict(
      `Driver's license expired on ${driver.licenseExpiry
        .toISOString()
        .slice(0, 10)} and cannot be assigned to trips`
    );
  }
  if (driver.status !== "AVAILABLE") {
    throw ApiError.conflict(
      `Driver is not available (current status: ${driver.status})`
    );
  }
}

function assertVehicleAssignable(vehicle: Vehicle, cargoWeight: number): void {
  if (vehicle.status !== "AVAILABLE") {
    throw ApiError.conflict(
      `Vehicle is not available (current status: ${vehicle.status})`
    );
  }
  if (cargoWeight > vehicle.maxLoadCapacity) {
    throw ApiError.conflict(
      `Cargo weight (${cargoWeight} kg) exceeds the vehicle's maximum load capacity (${vehicle.maxLoadCapacity} kg)`
    );
  }
}

// ---------- Create (Draft) ----------

export async function createTrip(
  input: CreateTripInput
): Promise<TripWithRelations> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
  });
  if (!vehicle) {
    throw ApiError.notFound("Vehicle not found");
  }

  const driver = await prisma.driver.findUnique({
    where: { id: input.driverId },
  });
  if (!driver) {
    throw ApiError.notFound("Driver not found");
  }

  // Spec: trips are created by selecting an AVAILABLE vehicle and driver,
  // and cargo must fit. Statuses do NOT change until dispatch.
  assertVehicleAssignable(vehicle, input.cargoWeight);
  assertDriverAssignable(driver);

  return prisma.trip.create({
    data: {
      source: input.source,
      destination: input.destination,
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      cargoWeight: input.cargoWeight,
      plannedDistance: input.plannedDistance,
      ...(input.revenue !== undefined ? { revenue: input.revenue } : {}),
    },
    include: { vehicle: true, driver: true },
  });
}

// ---------- List / Get ----------

export async function listTrips(
  filters: TripListFilters
): Promise<TripWithRelations[]> {
  const where: Prisma.TripWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.driverId) {
    where.driverId = filters.driverId;
  }
  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  return prisma.trip.findMany({
    where,
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTripById(id: string): Promise<TripWithRelations> {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) {
    throw ApiError.notFound("Trip not found");
  }
  return trip;
}

// ---------- Dispatch (Draft → Dispatched, statuses flip atomically) ----------

export async function dispatchTrip(id: string): Promise<TripWithRelations> {
  await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });
    if (!trip) {
      throw ApiError.notFound("Trip not found");
    }
    if (trip.status !== "DRAFT") {
      throw ApiError.conflict(
        `Only Draft trips can be dispatched (current status: ${trip.status})`
      );
    }

    // Re-validate at dispatch time: state may have changed since the draft.
    assertVehicleAssignable(trip.vehicle, trip.cargoWeight);
    assertDriverAssignable(trip.driver);

    // Guarded updates: the WHERE clause re-checks status at write time,
    // so two concurrent dispatches can never claim the same vehicle/driver.
    const vehicleClaim = await tx.vehicle.updateMany({
      where: { id: trip.vehicleId, status: "AVAILABLE" },
      data: { status: "ON_TRIP" },
    });
    if (vehicleClaim.count === 0) {
      throw ApiError.conflict("Vehicle is no longer available");
    }

    const driverClaim = await tx.driver.updateMany({
      where: { id: trip.driverId, status: "AVAILABLE" },
      data: { status: "ON_TRIP" },
    });
    if (driverClaim.count === 0) {
      throw ApiError.conflict("Driver is no longer available");
    }

    await tx.trip.update({
      where: { id },
      data: {
        status: "DISPATCHED",
        dispatchedAt: new Date(),
        startOdometer: trip.vehicle.odometer,
      },
    });
  });

  return getTripById(id);
}

// ---------- Complete (Dispatched → Completed, statuses restored) ----------

export async function completeTrip(
  id: string,
  input: CompleteTripInput
): Promise<TripWithRelations> {
  await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id } });
    if (!trip) {
      throw ApiError.notFound("Trip not found");
    }
    if (trip.status !== "DISPATCHED") {
      throw ApiError.conflict(
        `Only Dispatched trips can be completed (current status: ${trip.status})`
      );
    }
    if (trip.startOdometer !== null && input.endOdometer < trip.startOdometer) {
      throw ApiError.badRequest(
        `End odometer (${input.endOdometer}) cannot be lower than the odometer at dispatch (${trip.startOdometer})`
      );
    }

    // The trip row acts as the lock: only one of complete/cancel can win.
    const tripUpdate = await tx.trip.updateMany({
      where: { id, status: "DISPATCHED" },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        endOdometer: input.endOdometer,
        fuelConsumed: input.fuelConsumed,
        ...(input.revenue !== undefined ? { revenue: input.revenue } : {}),
      },
    });
    if (tripUpdate.count === 0) {
      throw ApiError.conflict(
        "Trip was updated by another request. Refresh and try again."
      );
    }

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "AVAILABLE", odometer: input.endOdometer },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: "AVAILABLE" },
    });
  });

  return getTripById(id);
}

// ---------- Cancel (Draft/Dispatched → Cancelled) ----------

export async function cancelTrip(id: string): Promise<TripWithRelations> {
  await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id } });
    if (!trip) {
      throw ApiError.notFound("Trip not found");
    }
    if (trip.status === "COMPLETED") {
      throw ApiError.conflict("Completed trips cannot be cancelled");
    }
    if (trip.status === "CANCELLED") {
      throw ApiError.conflict("Trip is already cancelled");
    }

    const wasDispatched = trip.status === "DISPATCHED";

    const tripUpdate = await tx.trip.updateMany({
      where: { id, status: trip.status },
      data: { status: "CANCELLED" },
    });
    if (tripUpdate.count === 0) {
      throw ApiError.conflict(
        "Trip was updated by another request. Refresh and try again."
      );
    }

    // Spec: cancelling a DISPATCHED trip restores vehicle and driver.
    // A Draft never flipped statuses, so there is nothing to restore.
    if (wasDispatched) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE" },
      });
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      });
    }
  });

  return getTripById(id);
}