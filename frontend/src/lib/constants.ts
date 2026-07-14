import {
  BarChart3,
  Fuel,
  LayoutDashboard,
  Route,
  Truck,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type {
  DriverStatus,
  ExpenseType,
  Role,
  TripStatus,
  VehicleStatus,
  VehicleType,
} from "./types";

/** Name of the cookie holding the JWT. Read by both the api layer and proxy.ts. */
export const TOKEN_COOKIE = "transitops_token";

// ---------- Endpoints ----------

/**
 * Every backend path in one place. A path is never inlined at a call site —
 * if an endpoint moves, it moves here and nowhere else.
 */
export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  vehicles: "/vehicles",
  drivers: "/drivers",
  trips: "/trips",
  maintenance: "/maintenance",
  expenses: "/expenses",
  fuelLogs: "/expenses/fuel-logs",
  expenseRecords: "/expenses/records",
  analytics: {
    dashboard: "/analytics/dashboard",
    fleetSummary: "/analytics/fleet-summary",
    vehicleRoi: "/analytics/vehicle-roi",
  },
} as const;

// ---------- Roles ----------

export const ROLE_LABELS: Record<Role, string> = {
  FLEET_MANAGER: "Fleet Manager",
  DRIVER: "Driver",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

/**
 * Where each role lands after signing in.
 *
 * Analytics is FLEET_MANAGER + FINANCIAL_ANALYST only (the backend returns 403
 * for anyone else), and the dashboard is built on the analytics endpoint — so
 * the other two roles must land somewhere they can actually read.
 */
export const HOME_BY_ROLE: Record<Role, string> = {
  FLEET_MANAGER: "/dashboard",
  FINANCIAL_ANALYST: "/dashboard",
  DRIVER: "/trips",
  SAFETY_OFFICER: "/drivers",
};

// ---------- Navigation ----------

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. An empty array means "every role". */
  roles: Role[];
}

/**
 * Nav visibility mirrors the backend RBAC matrix. This is cosmetic only — it
 * keeps users off screens that would 403 — and is never the enforcement point.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"],
  },
  { href: "/vehicles", label: "Vehicles", icon: Truck, roles: [] },
  { href: "/drivers", label: "Drivers", icon: UserRound, roles: [] },
  { href: "/trips", label: "Trips", icon: Route, roles: [] },
  { href: "/maintenance", label: "Maintenance", icon: Wrench, roles: [] },
  { href: "/expenses", label: "Fuel & Expenses", icon: Fuel, roles: [] },
  {
    href: "/analytics",
    label: "Reports & Analytics",
    icon: BarChart3,
    roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"],
  },
];

export function canAccessNavItem(item: NavItem, role: Role | null): boolean {
  if (!role) return false;
  if (item.roles.length === 0) return true;
  return item.roles.includes(role);
}

// ---------- Status metadata ----------

export interface StatusMeta {
  label: string;
  color: string;
}

export const VEHICLE_STATUS_META: Record<VehicleStatus, StatusMeta> = {
  AVAILABLE: { label: "Available", color: "var(--status-available)" },
  ON_TRIP: { label: "On Trip", color: "var(--status-ontrip)" },
  IN_SHOP: { label: "In Shop", color: "var(--status-shop)" },
  RETIRED: { label: "Retired", color: "var(--status-retired)" },
};

export const DRIVER_STATUS_META: Record<DriverStatus, StatusMeta> = {
  AVAILABLE: { label: "Available", color: "var(--status-available)" },
  ON_TRIP: { label: "On Trip", color: "var(--status-ontrip)" },
  OFF_DUTY: { label: "Off Duty", color: "var(--status-retired)" },
  SUSPENDED: { label: "Suspended", color: "var(--status-suspended)" },
};

export const TRIP_STATUS_META: Record<TripStatus, StatusMeta> = {
  DRAFT: { label: "Draft", color: "var(--status-retired)" },
  DISPATCHED: { label: "Dispatched", color: "var(--status-ontrip)" },
  COMPLETED: { label: "Completed", color: "var(--status-available)" },
  CANCELLED: { label: "Cancelled", color: "var(--status-suspended)" },
};

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  TRUCK: "Truck",
  VAN: "Van",
  TRAILER: "Trailer",
  BIKE: "Bike",
};

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  TOLL: "Toll",
  PARKING: "Parking",
  FINE: "Fine",
  OTHER: "Other",
};
