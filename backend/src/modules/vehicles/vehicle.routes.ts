import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import * as vehicleController from "./vehicle.controller";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "./vehicle.validation";

export const vehicleRouter = Router();

// Every vehicle route requires authentication.
vehicleRouter.use(auth);

// Reads: any authenticated user.
vehicleRouter.get("/", vehicleController.listVehicles);
vehicleRouter.get("/:id", vehicleController.getVehicle);

// Writes: Fleet Manager only (RBAC matrix, Module 2).
vehicleRouter.post(
  "/",
  requireRole("FLEET_MANAGER"),
  validate(createVehicleSchema),
  vehicleController.createVehicle
);

vehicleRouter.patch(
  "/:id",
  requireRole("FLEET_MANAGER"),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle
);

vehicleRouter.delete(
  "/:id",
  requireRole("FLEET_MANAGER"),
  vehicleController.deleteVehicle
);