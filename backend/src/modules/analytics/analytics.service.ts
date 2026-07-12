import { VehicleStatus, VehicleType } from "@prisma/client";
import { prisma } from "../../config/db";

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// ---------- Dashboard KPIs (spec 3.2) ----------

export async function getDashboardKpis() {
  const [
    totalVehicles,
    availableVehicles,
    vehiclesOnTrip,
    vehiclesInShop,
    totalDrivers,
    availableDrivers,
    driversOnTrip,
    totalTrips,
    pendingTrips,
    activeTrips,
    completedTrips,
    cancelledTrips,
    openMaintenanceLogs,
    fuelAgg,
    maintenanceAgg,
    expenseAgg,
    revenueAgg,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { status: "AVAILABLE" } }),
    prisma.driver.count({ where: { status: "ON_TRIP" } }),
    prisma.trip.count(),
    prisma.trip.count({ where: { status: "DRAFT" } }),
    prisma.trip.count({ where: { status: "DISPATCHED" } }),
    prisma.trip.count({ where: { status: "COMPLETED" } }),
    prisma.trip.count({ where: { status: "CANCELLED" } }),
    prisma.maintenanceLog.count({ where: { status: "OPEN" } }),
    prisma.fuelLog.aggregate({ _sum: { cost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.trip.aggregate({
      where: { status: "COMPLETED" },
      _sum: { revenue: true },
    }),
  ]);

  const totalFuelCost = round(fuelAgg._sum.cost ?? 0);
  const totalMaintenanceCost = round(maintenanceAgg._sum.cost ?? 0);
  const totalExpenseCost = round(expenseAgg._sum.amount ?? 0);
  const totalRevenue = round(revenueAgg._sum.revenue ?? 0);

  // Utilization = vehicles on trip / operational (non-retired) vehicles.
  const operationalVehicles =
    availableVehicles + vehiclesOnTrip + vehiclesInShop;
  const fleetUtilization =
    operationalVehicles === 0
      ? 0
      : round((vehiclesOnTrip / operationalVehicles) * 100);

  return {
    vehicles: {
      total: totalVehicles,
      available: availableVehicles,
      onTrip: vehiclesOnTrip,
      inShop: vehiclesInShop,
    },
    drivers: {
      total: totalDrivers,
      available: availableDrivers,
      onTrip: driversOnTrip,
    },
    trips: {
      total: totalTrips,
      pending: pendingTrips,
      active: activeTrips,
      completed: completedTrips,
      cancelled: cancelledTrips,
    },
    maintenance: { openLogs: openMaintenanceLogs },
    finance: {
      totalFuelCost,
      totalMaintenanceCost,
      totalExpenseCost,
      totalOperationalCost: round(totalFuelCost + totalMaintenanceCost),
      totalRevenue,
    },
    fleetUtilization,
  };
}

// ---------- Per-vehicle metrics (spec 3.8) ----------

export interface VehicleMetrics {
  vehicleId: string;
  registrationNumber: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  tripsCompleted: number;
  totalDistance: number; // km, from completed trips (endOdometer − startOdometer)
  fuelConsumed: number; // liters, recorded at trip completion
  fuelEfficiency: number | null; // km per liter; null when no fuel recorded
  fuelCost: number; // from fuel logs
  maintenanceCost: number;
  operationalCost: number; // Fuel + Maintenance (spec 3.7)
  otherExpenses: number; // tolls, parking, fines — excluded from operationalCost
  revenue: number; // completed trips only
  acquisitionCost: number;
  roi: number | null; // (revenue − operationalCost) / acquisitionCost
}

export async function getFleetSummary(): Promise<VehicleMetrics[]> {
  const [vehicles, tripGroups, fuelGroups, maintenanceGroups, expenseGroups] =
    await Promise.all([
      prisma.vehicle.findMany({ orderBy: { registrationNumber: "asc" } }),
      prisma.trip.groupBy({
        by: ["vehicleId"],
        where: { status: "COMPLETED" },
        _count: { _all: true },
        // Sum(end − start) = Sum(end) − Sum(start); both fields are always
        // set for completed trips by the dispatch/complete flow (Module 6).
        _sum: {
          revenue: true,
          fuelConsumed: true,
          startOdometer: true,
          endOdometer: true,
        },
      }),
      prisma.fuelLog.groupBy({ by: ["vehicleId"], _sum: { cost: true } }),
      prisma.maintenanceLog.groupBy({
        by: ["vehicleId"],
        _sum: { cost: true },
      }),
      prisma.expense.groupBy({ by: ["vehicleId"], _sum: { amount: true } }),
    ]);

  const tripMap = new Map(tripGroups.map((g) => [g.vehicleId, g]));
  const fuelMap = new Map(
    fuelGroups.map((g) => [g.vehicleId, g._sum.cost ?? 0])
  );
  const maintenanceMap = new Map(
    maintenanceGroups.map((g) => [g.vehicleId, g._sum.cost ?? 0])
  );
  const expenseMap = new Map(
    expenseGroups.map((g) => [g.vehicleId, g._sum.amount ?? 0])
  );

  return vehicles.map((vehicle) => {
    const trips = tripMap.get(vehicle.id);
    const tripsCompleted = trips?._count._all ?? 0;
    const totalDistance = Math.max(
      0,
      round((trips?._sum.endOdometer ?? 0) - (trips?._sum.startOdometer ?? 0))
    );
    const fuelConsumed = round(trips?._sum.fuelConsumed ?? 0);
    const revenue = round(trips?._sum.revenue ?? 0);

    const fuelCost = round(fuelMap.get(vehicle.id) ?? 0);
    const maintenanceCost = round(maintenanceMap.get(vehicle.id) ?? 0);
    const operationalCost = round(fuelCost + maintenanceCost);
    const otherExpenses = round(expenseMap.get(vehicle.id) ?? 0);

    const fuelEfficiency =
      fuelConsumed > 0 ? round(totalDistance / fuelConsumed) : null;
    const roi =
      vehicle.acquisitionCost > 0
        ? round((revenue - operationalCost) / vehicle.acquisitionCost, 4)
        : null;

    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      status: vehicle.status,
      tripsCompleted,
      totalDistance,
      fuelConsumed,
      fuelEfficiency,
      fuelCost,
      maintenanceCost,
      operationalCost,
      otherExpenses,
      revenue,
      acquisitionCost: vehicle.acquisitionCost,
      roi,
    };
  });
}

// ---------- Vehicle ROI projection (spec 3.8 formula, transparent parts) ----------

export async function getVehicleRoi() {
  const fleet = await getFleetSummary();
  return fleet.map((v) => ({
    vehicleId: v.vehicleId,
    registrationNumber: v.registrationNumber,
    name: v.name,
    revenue: v.revenue,
    fuelCost: v.fuelCost,
    maintenanceCost: v.maintenanceCost,
    acquisitionCost: v.acquisitionCost,
    roi: v.roi,
  }));
}

// ---------- CSV export (spec 3.8: "Support CSV export") ----------

function csvEscape(value: string | number | null): string {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function fleetSummaryToCsv(rows: VehicleMetrics[]): string {
  const headers = [
    "registrationNumber",
    "name",
    "type",
    "status",
    "tripsCompleted",
    "totalDistanceKm",
    "fuelConsumedL",
    "fuelEfficiencyKmPerL",
    "fuelCost",
    "maintenanceCost",
    "operationalCost",
    "otherExpenses",
    "revenue",
    "acquisitionCost",
    "roi",
  ];
  const lines = rows.map((r) =>
    [
      r.registrationNumber,
      r.name,
      r.type,
      r.status,
      r.tripsCompleted,
      r.totalDistance,
      r.fuelConsumed,
      r.fuelEfficiency,
      r.fuelCost,
      r.maintenanceCost,
      r.operationalCost,
      r.otherExpenses,
      r.revenue,
      r.acquisitionCost,
      r.roi,
    ]
      .map(csvEscape)
      .join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}