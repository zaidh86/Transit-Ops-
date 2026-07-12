import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import * as driversController from "./drivers.controller";
import { createDriverSchema, updateDriverSchema } from "./drivers.validation";

export const driversRouter = Router();

driversRouter.use(auth);

driversRouter.get("/", driversController.list);
driversRouter.post("/", requireRole("FLEET_MANAGER"), validate(createDriverSchema), driversController.create);
driversRouter.patch("/:id", requireRole("FLEET_MANAGER"), validate(updateDriverSchema), driversController.update);
driversRouter.delete("/:id", requireRole("FLEET_MANAGER"), driversController.remove);