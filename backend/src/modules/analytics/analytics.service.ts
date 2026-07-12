import { Prisma, TripStatus, VehicleStatus, DriverStatus } from "@prisma/client";
import { prisma } from "../../config/db";

export interface DashboardKpis {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [vehicleCounts, driverCounts, tripCounts, totalVehicles] = await Promise.all([
    prisma.vehicle.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.driver.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.trip.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.vehicle.count(),
  ]);

  const vehicleCountMap = Object.fromEntries(vehicleCounts.map((item) => [item.status, item._count._all]));
  const driverCountMap = Object.fromEntries(driverCounts.map((item) => [item.status, item._count._all]));
  const tripCountMap = Object.fromEntries(tripCounts.map((item) => [item.status, item._count._all]));

  const activeTrips = tripCountMap[TripStatus.DISPATCHED] ?? 0;
  const utilization = totalVehicles > 0 ? Math.min(100, Math.round((activeTrips / totalVehicles) * 100)) : 0;

  return {
    activeVehicles: (vehicleCountMap[VehicleStatus.AVAILABLE] ?? 0) + (vehicleCountMap[VehicleStatus.ON_TRIP] ?? 0) + (vehicleCountMap[VehicleStatus.IN_SHOP] ?? 0),
    availableVehicles: vehicleCountMap[VehicleStatus.AVAILABLE] ?? 0,
    vehiclesInMaintenance: vehicleCountMap[VehicleStatus.IN_SHOP] ?? 0,
    activeTrips,
    pendingTrips: tripCountMap[TripStatus.DRAFT] ?? 0,
    driversOnDuty: driverCountMap[DriverStatus.ON_TRIP] ?? 0,
    fleetUtilization: utilization,
  };
}