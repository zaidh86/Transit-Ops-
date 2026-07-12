import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import * as analyticsController from "./analytics.controller";

export const analyticsRouter = Router();

// Analytics is restricted to the two oversight personas (updated RBAC matrix).
analyticsRouter.use(auth);
analyticsRouter.use(requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"));

analyticsRouter.get("/dashboard", analyticsController.dashboard);
analyticsRouter.get("/fleet-summary", analyticsController.fleetSummary);
analyticsRouter.get("/vehicle-roi", analyticsController.vehicleRoi);