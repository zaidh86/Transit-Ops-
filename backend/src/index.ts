import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { prisma } from "./config/db";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { driversRouter } from "./modules/drivers/drivers.routes";
import { maintenanceRouter } from "./modules/maintenance/maintenance.routes";
import { expensesRouter } from "./modules/expenses/expenses.routes";
import { analyticsRouter } from "./modules/analytics/analytics.routes";

const app = express();

// ---------- Global middleware ----------
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan("dev"));

// ---------- Routes ----------
app.get("/api/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`; // verifies DB connectivity end-to-end
  res.json({
    success: true,
    data: { status: "ok", uptime: Math.round(process.uptime()) },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/analytics", analyticsRouter);

// Module routers will continue to be mounted here (vehicles, drivers, trips, ...)

// ---------- Error handling (must stay last) ----------
app.use(notFoundHandler);
app.use(errorHandler);

// ---------- Startup ----------
const server = app.listen(env.port, () => {
  console.log(`TransitOps API running on http://localhost:${env.port}`);
});

process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});