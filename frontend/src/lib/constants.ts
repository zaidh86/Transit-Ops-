import {
  LayoutDashboard,
  Truck,
  UserRound,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export const TOKEN_COOKIE = "transitops_token";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Roles allowed to see this nav item. Empty array = all roles.
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [] },
  {
    href: "/vehicles",
    label: "Vehicles",
    icon: Truck,
    roles: ["FLEET_MANAGER", "SAFETY_OFFICER"],
  },
  {
    href: "/drivers",
    label: "Drivers",
    icon: UserRound,
    roles: ["FLEET_MANAGER", "SAFETY_OFFICER"],
  },
  {
    href: "/trips",
    label: "Trips",
    icon: Route,
    roles: ["FLEET_MANAGER", "DRIVER"],
  },
  {
    href: "/maintenance",
    label: "Maintenance",
    icon: Wrench,
    roles: ["FLEET_MANAGER"],
  },
  {
    href: "/expenses",
    label: "Fuel & Expenses",
    icon: Fuel,
    roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"],
  },
  {
    href: "/analytics",
    label: "Reports & Analytics",
    icon: BarChart3,
    roles: ["FLEET_MANAGER", "FINANCIAL_ANALYST"],
  },
];

export function canAccessNavItem(item: NavItem, role: Role | undefined) {
  if (!role) return false;
  if (item.roles.length === 0) return true;
  return item.roles.includes(role);
}

export const VEHICLE_STATUS_META = {
  AVAILABLE: { label: "Available", color: "var(--status-available)" },
  ON_TRIP: { label: "On Trip", color: "var(--status-ontrip)" },
  IN_SHOP: { label: "In Shop", color: "var(--status-shop)" },
  RETIRED: { label: "Retired", color: "var(--status-retired)" },
} as const;

export const DRIVER_STATUS_META = {
  AVAILABLE: { label: "Available", color: "var(--status-available)" },
  ON_TRIP: { label: "On Trip", color: "var(--status-ontrip)" },
  OFF_DUTY: { label: "Off Duty", color: "var(--status-retired)" },
  SUSPENDED: { label: "Suspended", color: "var(--status-suspended)" },
} as const;

export const TRIP_STATUS_META = {
  DRAFT: { label: "Draft", color: "var(--status-retired)" },
  DISPATCHED: { label: "Dispatched", color: "var(--status-ontrip)" },
  COMPLETED: { label: "Completed", color: "var(--status-available)" },
  CANCELLED: { label: "Cancelled", color: "var(--status-suspended)" },
} as const;
