"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Gauge,
  Route,
  TrendingUp,
  Truck,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { useAuth } from "@/lib/auth-context";
import { useDashboardKpis } from "@/lib/queries/analytics";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { DashboardKpis } from "@/lib/types";

interface Kpi {
  id: string;
  label: string;
  icon: LucideIcon;
  /**
   * Reads the value out of the nested KPI payload. The backend groups its
   * counters (vehicles / drivers / trips / finance), so a flat key lookup does
   * not work — that mismatch is what left every tile showing a dash before.
   */
  value: (kpis: DashboardKpis) => string;
}

const KPIS: Kpi[] = [
  {
    id: "vehicles-total",
    label: "Total Vehicles",
    icon: Truck,
    value: (kpis) => String(kpis.vehicles.total),
  },
  {
    id: "vehicles-available",
    label: "Available Vehicles",
    icon: CheckCircle2,
    value: (kpis) => String(kpis.vehicles.available),
  },
  {
    id: "vehicles-in-shop",
    label: "In Maintenance",
    icon: Wrench,
    value: (kpis) => String(kpis.vehicles.inShop),
  },
  {
    id: "trips-active",
    label: "Active Trips",
    icon: Route,
    value: (kpis) => String(kpis.trips.active),
  },
  {
    id: "trips-pending",
    label: "Pending Trips",
    icon: Clock,
    value: (kpis) => String(kpis.trips.pending),
  },
  {
    id: "drivers-on-trip",
    label: "Drivers On Duty",
    icon: UserRound,
    value: (kpis) => String(kpis.drivers.onTrip),
  },
  {
    id: "fleet-utilization",
    label: "Fleet Utilization",
    icon: Gauge,
    value: (kpis) => formatPercent(kpis.fleetUtilization),
  },
  {
    id: "operational-cost",
    label: "Operational Cost",
    icon: DollarSign,
    value: (kpis) => formatCurrency(kpis.finance.totalOperationalCost),
  },
  {
    id: "revenue",
    label: "Total Revenue",
    icon: TrendingUp,
    value: (kpis) => formatCurrency(kpis.finance.totalRevenue),
  },
];

function DashboardContent() {
  const { user } = useAuth();
  const { data: kpis, isPending, isError, error, refetch } = useDashboardKpis();

  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here&apos;s what&apos;s moving across the fleet right now.
        </p>
      </header>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KPIS.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted">
                      {kpi.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-accent" aria-hidden />
                  </CardHeader>
                  <CardContent>
                    {isPending ? (
                      <Skeleton className="h-7 w-20" />
                    ) : (
                      <p className="font-mono text-2xl font-semibold text-foreground">
                        {kpi.value(kpis)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * The dashboard reads /analytics/dashboard, which the backend restricts to
 * Fleet Managers and Financial Analysts. Guarding here means the other two
 * roles get an explanation instead of a wall of 403s.
 */
export default function DashboardPage() {
  return (
    <RoleGuard allow={["FLEET_MANAGER", "FINANCIAL_ANALYST"]}>
      <DashboardContent />
    </RoleGuard>
  );
}
