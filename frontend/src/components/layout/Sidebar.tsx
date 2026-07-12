"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { NAV_ITEMS, canAccessNavItem } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useAuth();

  const items = role
    ? NAV_ITEMS.filter((item) => canAccessNavItem(item, role))
    : NAV_ITEMS;

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent">
          <Truck className="h-4 w-4" />
        </div>
        <span className="font-display text-sm font-semibold tracking-tight">
          TransitOps
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-raised text-foreground"
                  : "text-muted hover:bg-surface-raised/60 hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-rail"
                  className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-accent")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-2">
        v0.1 · dispatch console
      </div>
    </div>
  );
}
