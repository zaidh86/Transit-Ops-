// Domain types mirrored from the backend (see transitops-backend/prisma/schema.prisma).
// Adjust field names here if your Prisma models differ — this is the single
// place the rest of the frontend imports types from.

export type Role = "FLEET_MANAGER" | "DRIVER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";

export const ROLES: Role[] = [
  "FLEET_MANAGER",
  "DRIVER",
  "SAFETY_OFFICER",
  "FINANCIAL_ANALYST",
];

export const ROLE_LABELS: Record<Role, string> = {
  FLEET_MANAGER: "Fleet Manager",
  DRIVER: "Driver",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  name?: string;
  exp: number;
  iat: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region?: string;
}

export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
}

export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  status: TripStatus;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface DashboardKpis {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

export interface ApiErrorShape {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
