import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import * as maintenanceController from "./maintenance.controller";
import { createMaintenanceSchema, updateMaintenanceSchema } from "./maintenance.validation";

export const maintenanceRouter = Router();

maintenanceRouter.use(auth);

maintenanceRouter.get("/", maintenanceController.list);
maintenanceRouter.post(
  "/",
  requireRole("FLEET_MANAGER"),
  validate(createMaintenanceSchema),
  maintenanceController.create
);
maintenanceRouter.patch(
  "/:id",
  requireRole("FLEET_MANAGER"),
  validate(updateMaintenanceSchema),
  maintenanceController.update
);
maintenanceRouter.delete("/:id", requireRole("FLEET_MANAGER"), maintenanceController.remove);