# TransitOps — Frontend

Next.js (App Router) + TypeScript + Tailwind v4 + shadcn-style UI + Framer Motion + TanStack Query.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your Express backend
npm run dev
```

## What's wired up so far (Auth + RBAC + shell)

- **`src/lib/api.ts`** — axios instance, attaches the JWT to every request, redirects to `/login` on 401.
- **`src/lib/auth-context.tsx`** — `AuthProvider` / `useAuth()`. Login hits `POST /auth/login`
  (expects `{ token, user }`), stores the JWT in a cookie, decodes role/name/email from the JWT
  on refresh via `jwt-decode`.
- **`src/proxy.ts`** — route gate (Next.js 16's renamed `middleware.ts`). Redirects to `/login`
  if the auth cookie is missing; redirects away from `/login` if it's present. Real RBAC
  enforcement stays on the backend — this is just fast, cookie-presence routing.
- **`src/components/auth/RoleGuard.tsx`** — wrap any page's content in
  `<RoleGuard allow={["FLEET_MANAGER"]}>…</RoleGuard>` to restrict it client-side.
- **`src/components/layout/`** — `Sidebar` (role-filtered nav), `Navbar` (user menu + logout),
  `DashboardShell` (combines both, animated mobile drawer).
- **`src/app/(dashboard)/`** — protected route group; `dashboard/page.tsx` is a working example
  pulling KPIs via `useQuery` from `GET /analytics/dashboard`.
- **`src/lib/constants.ts`** — `NAV_ITEMS` (edit `roles: []` per item to control who sees what
  in the sidebar) and the status-color maps used by `<StatusBadge />`.
- **`src/types/index.ts`** — types for every entity in the spec (Vehicle, Driver, Trip,
  MaintenanceLog, FuelLog, Expense, DashboardKpis) — adjust field names if your Prisma schema
  differs.

## Design system

Dark "dispatch console" theme — graphite surfaces, one amber signal accent for primary actions,
dedicated status colors (available/on-trip/in-shop/suspended/retired) reused everywhere as a
colored 3px rail (`<Card accentColor="...">`) and in `<StatusBadge />`. Type: Space Grotesk
(display), Inter (UI/body), JetBrains Mono (registration numbers, odometer, IDs — anything that's
"data"). All tokens live in `src/app/globals.css`.

## Next screens to build (same pattern each time)

Vehicles, Drivers, Trips, Maintenance, Fuel & Expenses, Reports & Analytics — each as
`src/app/(dashboard)/<name>/page.tsx`, wrapped in `<RoleGuard>` per §2 Target Users, using
`useQuery`/`useMutation` against your Express routes via `api` from `src/lib/api.ts`.
