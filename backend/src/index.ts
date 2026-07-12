import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { prisma } from "./config/db";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { vehicleRouter } from "./modules/vehicles/vehicle.routes";

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
app.use("/api/vehicles", vehicleRouter);

// Module routers will continue to be mounted here (drivers, trips, ...)

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