"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Route, ShieldCheck, Sparkles, Truck, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const featureCards = [
  {
    icon: Truck,
    title: "Fleet control",
    description: "Track vehicles, utilization, status transitions, and dispatch readiness in one place.",
  },
  {
    icon: Users,
    title: "Driver compliance",
    description: "Keep licenses, safety scores, and assignment rules visible before a trip is created.",
  },
  {
    icon: Route,
    title: "Trip dispatch",
    description: "Move from draft to dispatch with the validation rules baked into the workflow.",
  },
  {
    icon: Wrench,
    title: "Maintenance flow",
    description: "Create service records, mark vehicles in shop, and restore them when work closes out.",
  },
];

const moduleCards = [
  { title: "Dashboard", text: "Fleet KPIs, utilization, and operational health at a glance." },
  { title: "Vehicles", text: "Registry, status, capacity, odometer, and region tracking." },
  { title: "Drivers", text: "License data, safety score, and assignment eligibility." },
  { title: "Trips", text: "Draft, dispatch, complete, and cancel with state changes." },
  { title: "Maintenance", text: "Service logs that automatically move vehicles into the shop." },
  { title: "Expenses", text: "Fuel, tolls, maintenance cost, and operational spend." },
];

const stats = [
  { label: "Modules planned", value: "6" },
  { label: "Core roles", value: "4" },
  { label: "Business rules", value: "10+" },
  { label: "Export options", value: "CSV" },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-[-10%] top-24 h-80 w-80 rounded-full bg-status-ontrip/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/3 h-72 w-72 rounded-full bg-status-available/10 blur-3xl" />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-14">
        <div className="flex flex-col justify-center gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs text-muted backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Smart transport operations platform
          </div>

          <div className="space-y-5">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Run the fleet from one console for dispatch, compliance, maintenance, and cost control.
            </motion.h1>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              TransitOps turns vehicle, driver, trip, and finance workflows into a single dashboard-ready interface.
              The frontend is shaped for RBAC, operational KPIs, and the next screens from the product spec.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-surface/80 backdrop-blur">
                <CardContent className="p-4">
                  <div className="font-display text-2xl font-semibold text-foreground">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="w-full space-y-4"
          >
            <Card className="border-border-strong bg-surface/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Built for controlled access
                </CardTitle>
                <CardDescription>
                  Authenticated users land in a protected dashboard shell; role-specific screens stay hidden until the backend is ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Fleet Manager", "Assets, dispatch, maintenance, expenses"],
                  ["Driver", "Trips, active deliveries, vehicle assignment"],
                  ["Safety Officer", "Licenses, compliance, safety scores"],
                  ["Financial Analyst", "Fuel, maintenance, profit visibility"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-md border border-border bg-background/50 p-3">
                    <div className="text-sm font-medium text-foreground">{title}</div>
                    <div className="mt-1 text-xs leading-5 text-muted">{text}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {featureCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 * index }}
                  >
                    <Card className="h-full bg-surface/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-accent" />
                          {card.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-6 text-muted">{card.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <Card className="bg-surface/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Planned frontend surface</CardTitle>
            <CardDescription>The main screens are already wired as route targets in the dashboard shell.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {moduleCards.map((module) => (
              <div key={module.title} className="rounded-md border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {module.title === "Reports & Analytics" ? <BarChart3 className="h-4 w-4 text-accent" /> : null}
                  {module.title}
                </div>
                <div className="mt-1 text-sm leading-6 text-muted">{module.text}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}