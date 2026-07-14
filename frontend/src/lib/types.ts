/**
 * The single source of truth for domain types on the frontend.
 *
 * These mirror what the backend actually SENDS, which is not always the Prisma
 * model: vehicles, trips and auth return raw Prisma rows, while drivers,
 * maintenance and expenses return hand-mapped DTOs with renamed fields and
 * date-only strings. Where the two differ, the DTO shape wins — that is the
 * bytes on the wire.
 */

// ---------- Enums (mirrors of the Prisma enums) ----------

export type Role =
  | "FLEET_MANAGER"
  | "DRIVER"
  | "SAFETY_OFFICER"
  | "FINANCIAL_ANALYST";

export type VehicleType = "TRUCK" | "VAN" | "TRAILER" | "BIKE";
export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
export type MaintenanceStatus = "OPEN" | "CLOSED";
export type ExpenseType = "TOLL" | "PARKING" | "FINE" | "OTHER";

/** Statuses a Fleet Manager may set by hand. ON_TRIP is owned by trip dispatch. */
export type ManualVehicleStatus = Exclude<VehicleStatus, "ON_TRIP">;

export const ROLES: readonly Role[] = [
  "FLEET_MANAGER",
  "DRIVER",
  "SAFETY_OFFICER",
  "FINANCIAL_ANALYST",
];

export const VEHICLE_TYPES: readonly VehicleType[] = [
  "TRUCK",
  "VAN",
  "TRAILER",
  "BIKE",
];

export const MANUAL_VEHICLE_STATUSES: readonly ManualVehicleStatus[] = [
  "AVAILABLE",
  "IN_SHOP",
  "RETIRED",
];

export const DRIVER_STATUSES: readonly DriverStatus[] = [
  "AVAILABLE",
  "ON_TRIP",
  "OFF_DUTY",
  "SUSPENDED",
];

export const EXPENSE_TYPES: readonly ExpenseType[] = [
  "TOLL",
  "PARKING",
  "FINE",
  "OTHER",
];

// ---------- Auth ----------

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** The payload the backend signs into the JWT. */
export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  iat: number;
  exp: number;
}

// ---------- Vehicles (raw Prisma model) ----------

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: VehicleType;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  region: string | null;
  status: VehicleStatus;
  createdAt: string;
}

export interface CreateVehiclePayload {
  registrationNumber: string;
  name: string;
  type: VehicleType;
  maxLoadCapacity: number;
  odometer?: number;
  acquisitionCost: number;
  region?: string;
  status?: ManualVehicleStatus;
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export interface VehicleFilters {
  type?: VehicleType;
  status?: VehicleStatus;
  region?: string;
  search?: string;
}

// ---------- Drivers (DTO: licenseExpiry is exposed as a date-only string) ----------

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  /** `YYYY-MM-DD` */
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
}

export interface CreateDriverPayload {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore?: number;
  status?: DriverStatus;
}

export type UpdateDriverPayload = Partial<CreateDriverPayload>;

// ---------- Trips (raw Prisma model, with vehicle + driver included) ----------

/**
 * Trips include the raw Prisma Driver row, which carries `licenseExpiry` —
 * NOT the `licenseExpiryDate` of the drivers-module DTO. Keeping these distinct
 * is deliberate; conflating them is how the dashboard KPI bug happened.
 */
export interface TripDriver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
  createdAt: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  revenue: number;
  status: TripStatus;
  vehicleId: string;
  driverId: string;
  vehicle: Vehicle;
  driver: TripDriver;
  startOdometer: number | null;
  endOdometer: number | null;
  fuelConsumed: number | null;
  dispatchedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateTripPayload {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  revenue?: number;
}

export interface CompleteTripPayload {
  endOdometer: number;
  fuelConsumed: number;
  revenue?: number;
}

export interface TripFilters {
  status?: TripStatus;
  driverId?: string;
  vehicleId?: string;
}

// ---------- Maintenance (DTO: `status` is flattened to `isActive`) ----------

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  /** The DTO collapses title/description into one field. */
  description: string;
  cost: number;
  isActive: boolean;
  /** `YYYY-MM-DD` */
  createdAt: string;
  /** `YYYY-MM-DD`; absent while the log is still open. */
  closedAt?: string;
}

export interface CreateMaintenancePayload {
  vehicleId: string;
  title: string;
  description?: string;
  cost?: number;
  status?: MaintenanceStatus;
}

export type UpdateMaintenancePayload = Partial<CreateMaintenancePayload>;

// ---------- Fuel & expenses (DTOs) ----------

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  /** `YYYY-MM-DD` */
  date: string;
}

export interface CreateFuelLogPayload {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  date?: string;
}

export type UpdateFuelLogPayload = Partial<CreateFuelLogPayload>;

export interface Expense {
  id: string;
  vehicleId: string;
  /** The DTO renames `type` to `category`. */
  category: ExpenseType;
  amount: number;
  /** `YYYY-MM-DD` */
  date: string;
  /** The DTO renames `description` to `notes`. */
  notes?: string;
}

export interface CreateExpensePayload {
  vehicleId: string;
  type: ExpenseType;
  amount: number;
  description?: string;
  date?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

/** `GET /expenses` returns both collections in a single call. */
export interface ExpenseModule {
  fuelLogs: FuelLog[];
  expenses: Expense[];
}

// ---------- Analytics ----------

export interface DashboardKpis {
  vehicles: { total: number; available: number; onTrip: number; inShop: number };
  drivers: { total: number; available: number; onTrip: number };
  trips: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  maintenance: { openLogs: number };
  finance: {
    totalFuelCost: number;
    totalMaintenanceCost: number;
    totalExpenseCost: number;
    totalOperationalCost: number;
    totalRevenue: number;
  };
  fleetUtilization: number;
}

export interface VehicleMetrics {
  vehicleId: string;
  registrationNumber: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  tripsCompleted: number;
  totalDistance: number;
  fuelConsumed: number;
  /** km per litre; null when no fuel was recorded. */
  fuelEfficiency: number | null;
  fuelCost: number;
  maintenanceCost: number;
  /** Fuel + maintenance. Tolls, parking and fines are NOT included. */
  operationalCost: number;
  otherExpenses: number;
  revenue: number;
  acquisitionCost: number;
  /** (revenue − operationalCost) / acquisitionCost; null when cost is 0. */
  roi: number | null;
}

/**
 * GET /analytics/vehicle-roi has no frontend type because nothing consumes it:
 * its payload is a strict subset of the fleet summary above, which already
 * carries `roi` per vehicle. See lib/queries/analytics.ts.
 */
