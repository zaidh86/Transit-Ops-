"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Globe,
  Menu,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { AppLogo } from "@/components/branding/AppLogo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Modules", href: "#modules" },
  { label: "CTA", href: "#cta" },
];

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

const stats = [
  { label: "Core modules", value: "6" },
  { label: "Roles supported", value: "4" },
  { label: "Business rules", value: "10+" },
  { label: "Export ready", value: "CSV" },
];

const workflow = [
  {
    step: "01",
    title: "Register assets",
    text: "Create vehicle and driver records with the operational fields the dispatch team needs.",
  },
  {
    step: "02",
    title: "Validate assignments",
    text: "Trips respect load, availability, license, and maintenance rules before dispatch starts.",
  },
  {
    step: "03",
    title: "Track performance",
    text: "Monitor fuel, maintenance, utilization, and profitability from one consistent dashboard.",
  },
];

const proofPoints = [
  "Vehicle and driver status rails",
  "Maintenance-aware trip selection",
  "Fuel and expense tracking",
  "Dashboard KPI surface",
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-[-8%] top-24 h-96 w-96 rounded-full bg-status-ontrip/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-1/4 h-80 w-80 rounded-full bg-status-available/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <AppLogo size={36} labelClassName="text-base text-foreground" />

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-muted transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <AnimatedThemeToggler
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-border-strong hover:bg-surface-raised"
              aria-label="Toggle theme"
              variant="circle"
              fromCenter
            />
            <Button asChild variant="secondary">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <AnimatedThemeToggler
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:border-border-strong hover:bg-surface-raised"
              aria-label="Toggle theme"
              variant="circle"
              fromCenter
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-border bg-background/95 px-4 pb-4 pt-3 backdrop-blur-xl sm:hidden">
            <div className="space-y-2">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button asChild variant="secondary" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-20">
        <div className="flex flex-col justify-center gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs text-muted backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Smart transport operations platform
          </div>

          <div className="space-y-5">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              One place to run dispatch, maintenance, compliance, and fleet cost control.
            </motion.h1>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              TransitOps gives logistics teams a single operations surface for vehicles, drivers, trips,
              fuel, and expenses. The frontend is now structured as a complete landing page that leads into the app.
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
              <Link href="#features">Explore features</Link>
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

          <div className="flex flex-wrap gap-2 text-xs text-muted-2">
            {proofPoints.map((point) => (
              <span key={point} className="rounded-full border border-border bg-surface/70 px-3 py-1">
                {point}
              </span>
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
                  Authenticated users enter a protected console with role-aware navigation and status-driven screens.
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

      <section id="features" className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
        <div className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-2">Platform surface</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Built to cover the whole fleet workflow.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Every core area from the spec is represented in the frontend, so the app feels complete even before
            backend data is plugged in.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
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
      </section>

      <section id="workflow" className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-2">Workflow</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              A simple operating loop for the whole team.
            </h2>
            <p className="text-sm leading-6 text-muted">
              The landing page explains the product quickly, then the UI transitions into the dashboard shell and
              module pages that match the working patterns already in the app.
            </p>
          </div>

          <div className="grid gap-4">
            {workflow.map((item) => (
              <Card key={item.step} className="bg-surface/80 backdrop-blur">
                <CardContent className="flex gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-sm text-accent">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold text-foreground">{item.title}</div>
                    <p className="mt-1 text-sm leading-6 text-muted">{item.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
        <Card className="bg-surface/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Planned frontend surface</CardTitle>
            <CardDescription>The main screens are already wired as route targets in the dashboard shell.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Dashboard", "Fleet KPIs, utilization, and operational health at a glance."],
              ["Vehicles", "Registry, status, capacity, odometer, and region tracking."],
              ["Drivers", "License data, safety score, and assignment eligibility."],
              ["Trips", "Draft, dispatch, complete, and cancel with state changes."],
              ["Maintenance", "Service logs that automatically move vehicles into the shop."],
              ["Expenses", "Fuel, tolls, maintenance cost, and operational spend."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-md border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {title === "Dashboard" ? <BarChart3 className="h-4 w-4 text-accent" /> : null}
                  {title}
                </div>
                <div className="mt-1 text-sm leading-6 text-muted">{text}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [Clock, "Fast routing", "Landing, login, dashboard"],
            [Users, "Role aware", "Four target user types"],
            [CheckCircle2, "Rules-first", "Visibility follows business rules"],
            [Globe, "Responsive", "Mobile and desktop"],
          ].map(([Icon, title, text]) => (
            <Card key={title as string} className="bg-surface/80 backdrop-blur">
              <CardContent className="p-4">
                <Icon className="h-5 w-5 text-accent" />
                <div className="mt-3 font-medium text-foreground">{title as string}</div>
                <div className="mt-1 text-sm text-muted">{text as string}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="cta" className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-10">
        <Card className="relative overflow-hidden border-border-strong bg-surface/90 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-status-ontrip/10" />
          <CardContent className="relative grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-2">Get started</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Ready to move from spreadsheets to a dispatch console?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
                The frontend is now styled as a complete public site with a sticky top bar, theme toggle, and
                module-driven product story. Sign in to open the dashboard and continue the workflow.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
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
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-accent" />
            <span>TransitOps · Smart transport operations platform</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}