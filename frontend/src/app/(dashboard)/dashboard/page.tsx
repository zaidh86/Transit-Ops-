"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Truck,
  CheckCircle2,
  Wrench,
  Route,
  Clock,
  UserRound,
  Gauge,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardKpis } from "@/types";

interface KpiConfigItem {
  key: keyof DashboardKpis;
  label: string;
  icon: typeof Truck;
  suffix?: string;
}

const KPI_CONFIG: KpiConfigItem[] = [
  { key: "activeVehicles", label: "Active Vehicles", icon: Truck },
  { key: "availableVehicles", label: "Available Vehicles", icon: CheckCircle2 },
  { key: "vehiclesInMaintenance", label: "In Maintenance", icon: Wrench },
  { key: "activeTrips", label: "Active Trips", icon: Route },
  { key: "pendingTrips", label: "Pending Trips", icon: Clock },
  { key: "driversOnDuty", label: "Drivers On Duty", icon: UserRound },
  { key: "fleetUtilization", label: "Fleet Utilization", icon: Gauge, suffix: "%" },
];

async function fetchDashboardKpis(): Promise<DashboardKpis> {
  const { data } = await api.get<DashboardKpis>("/analytics/dashboard");
  return data;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: fetchDashboardKpis,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted">
          Here&apos;s what&apos;s moving across the fleet right now.
        </p>
      </div>

      {isError && (
        <div className="rounded-md border border-status-suspended/40 bg-status-suspended/10 px-4 py-3 text-sm text-status-suspended">
          Couldn&apos;t reach the analytics API. Check{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_API_URL</code> and that
          the backend is running.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CONFIG.map((kpi, i) => {
          const Icon = kpi.icon;
          const value = data?.[kpi.key];
          return (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted">
                    {kpi.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-7 w-16 animate-pulse rounded bg-surface-raised" />
                  ) : (
                    <div className="font-mono text-2xl font-semibold text-foreground">
                      {value ?? "—"}
                      {kpi.suffix && value !== undefined ? kpi.suffix : ""}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next up</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted">
          Vehicle registry, driver management, trip dispatch, maintenance,
          fuel &amp; expense tracking, and reports each get their own screen
          under <code className="font-mono text-xs">src/app/(dashboard)/…</code>,
          following this same shell + RoleGuard + react-query pattern.
        </CardContent>
      </Card>
    </div>
  );
}
