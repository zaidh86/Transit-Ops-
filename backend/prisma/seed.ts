import bcrypt from "bcryptjs";
import { prisma } from "../src/config/db";

const roles = {
  FLEET_MANAGER: "FLEET_MANAGER",
  DRIVER: "DRIVER",
  SAFETY_OFFICER: "SAFETY_OFFICER",
  FINANCIAL_ANALYST: "FINANCIAL_ANALYST",
} as const;

const vehicleTypes = {
  TRUCK: "TRUCK",
  VAN: "VAN",
  TRAILER: "TRAILER",
  BIKE: "BIKE",
} as const;

const vehicleStatuses = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  IN_SHOP: "IN_SHOP",
  RETIRED: "RETIRED",
} as const;

const driverStatuses = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  OFF_DUTY: "OFF_DUTY",
  SUSPENDED: "SUSPENDED",
} as const;

const maintenanceStatuses = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

const expenseTypes = {
  TOLL: "TOLL",
  PARKING: "PARKING",
  FINE: "FINE",
  OTHER: "OTHER",
} as const;

const tripStatuses = {
  DRAFT: "DRAFT",
  DISPATCHED: "DISPATCHED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

async function main() {
  const password = await bcrypt.hash("Password123!", 10);

  const users = [
    {
      email: "fleet@transitops.com",
      name: "Fleet Manager",
      role: roles.FLEET_MANAGER,
    },
    {
      email: "driver@transitops.com",
      name: "Driver User",
      role: roles.DRIVER,
    },
    {
      email: "safety@transitops.com",
      name: "Safety Officer",
      role: roles.SAFETY_OFFICER,
    },
    {
      email: "finance@transitops.com",
      name: "Financial Analyst",
      role: roles.FINANCIAL_ANALYST,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, password },
      create: { ...user, password },
    });
  }

  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { registrationNumber: "TR-2041" },
      update: {},
      create: {
        registrationNumber: "TR-2041",
        name: "Atlas Hauler",
        type: vehicleTypes.TRUCK,
        maxLoadCapacity: 18000,
        odometer: 124400,
        acquisitionCost: 98000,
        region: "North",
        status: vehicleStatuses.AVAILABLE,
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "VN-1188" },
      update: {},
      create: {
        registrationNumber: "VN-1188",
        name: "City Van 18",
        type: vehicleTypes.VAN,
        maxLoadCapacity: 3200,
        odometer: 78300,
        acquisitionCost: 45000,
        region: "Central",
        status: vehicleStatuses.ON_TRIP,
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "TR-7782" },
      update: {},
      create: {
        registrationNumber: "TR-7782",
        name: "Service Unit 7",
        type: vehicleTypes.TRAILER,
        maxLoadCapacity: 22000,
        odometer: 201200,
        acquisitionCost: 112000,
        region: "West",
        status: vehicleStatuses.IN_SHOP,
      },
    }),
  ]);

  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: "DL-10458" },
      update: {},
      create: {
        name: "Alex Morgan",
        licenseNumber: "DL-10458",
        licenseCategory: "C1",
        licenseExpiry: new Date("2027-02-14"),
        contactNumber: "+1-555-0104",
        safetyScore: 96,
        status: driverStatuses.AVAILABLE,
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-20481" },
      update: {},
      create: {
        name: "Fatima Hassan",
        licenseNumber: "DL-20481",
        licenseCategory: "C",
        licenseExpiry: new Date("2026-10-02"),
        contactNumber: "+1-555-0116",
        safetyScore: 91,
        status: driverStatuses.ON_TRIP,
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-11922" },
      update: {},
      create: {
        name: "Jordan Lee",
        licenseNumber: "DL-11922",
        licenseCategory: "B",
        licenseExpiry: new Date("2026-12-09"),
        contactNumber: "+1-555-0142",
        safetyScore: 78,
        status: driverStatuses.SUSPENDED,
      },
    }),
  ]);

  const trip = await prisma.trip.upsert({
    where: { id: "trip-demo-001" },
    update: {},
    create: {
      id: "trip-demo-001",
      source: "Depot A",
      destination: "Harbor Logistics",
      cargoWeight: 12400,
      plannedDistance: 240,
      revenue: 4200,
      status: tripStatuses.DISPATCHED,
      vehicleId: vehicles[1].id,
      driverId: drivers[1].id,
      dispatchedAt: new Date(),
      startOdometer: 78300,
    },
  });

  await prisma.trip.upsert({
    where: { id: "trip-demo-002" },
    update: {},
    create: {
      id: "trip-demo-002",
      source: "Distribution Yard",
      destination: "Retail Hub",
      cargoWeight: 6400,
      plannedDistance: 110,
      revenue: 1900,
      status: tripStatuses.DRAFT,
      vehicleId: vehicles[0].id,
      driverId: drivers[0].id,
    },
  });

  const maintenance = await prisma.maintenanceLog.upsert({
    where: { id: "mnt-demo-001" },
    update: {},
    create: {
      id: "mnt-demo-001",
      vehicleId: vehicles[2].id,
      title: "Oil change and inspection",
      description: "Oil change and inspection",
      cost: 340,
      status: maintenanceStatuses.OPEN,
    },
  });

  await prisma.maintenanceLog.upsert({
    where: { id: "mnt-demo-002" },
    update: {},
    create: {
      id: "mnt-demo-002",
      vehicleId: vehicles[0].id,
      title: "Brake pad replacement",
      description: "Brake pad replacement",
      cost: 780,
      status: maintenanceStatuses.CLOSED,
      closedAt: new Date("2026-07-04"),
    },
  });

  await prisma.fuelLog.upsert({
    where: { id: "fuel-demo-001" },
    update: {},
    create: {
      id: "fuel-demo-001",
      vehicleId: vehicles[0].id,
      tripId: trip.id,
      liters: 82,
      cost: 128,
      date: new Date("2026-07-12"),
    },
  });

  await prisma.fuelLog.upsert({
    where: { id: "fuel-demo-002" },
    update: {},
    create: {
      id: "fuel-demo-002",
      vehicleId: vehicles[1].id,
      liters: 190,
      cost: 312,
      date: new Date("2026-07-11"),
    },
  });

  await prisma.expense.upsert({
    where: { id: "exp-demo-001" },
    update: {},
    create: {
      id: "exp-demo-001",
      vehicleId: vehicles[0].id,
      type: expenseTypes.TOLL,
      amount: 24,
      description: "North corridor",
      date: new Date("2026-07-12"),
    },
  });

  await prisma.expense.upsert({
    where: { id: "exp-demo-002" },
    update: {},
    create: {
      id: "exp-demo-002",
      vehicleId: maintenance.vehicleId,
      type: expenseTypes.OTHER,
      amount: 340,
      description: "Oil change",
      date: new Date("2026-07-12"),
    },
  });

  console.log("Seeded TransitOps demo data");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });