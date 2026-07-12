import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import * as expensesController from "./expenses.controller";
import {
  createExpenseSchema,
  createFuelLogSchema,
  updateExpenseSchema,
  updateFuelLogSchema,
} from "./expenses.validation";

export const expensesRouter = Router();

expensesRouter.use(auth);

expensesRouter.get("/", expensesController.list);

expensesRouter.post(
  "/fuel-logs",
  requireRole("FLEET_MANAGER"),
  validate(createFuelLogSchema),
  expensesController.createFuelLog
);
expensesRouter.patch(
  "/fuel-logs/:id",
  requireRole("FLEET_MANAGER"),
  validate(updateFuelLogSchema),
  expensesController.updateFuelLog
);
expensesRouter.delete("/fuel-logs/:id", requireRole("FLEET_MANAGER"), expensesController.removeFuelLog);

expensesRouter.post(
  "/records",
  requireRole("FLEET_MANAGER"),
  validate(createExpenseSchema),
  expensesController.createExpense
);
expensesRouter.patch(
  "/records/:id",
  requireRole("FLEET_MANAGER"),
  validate(updateExpenseSchema),
  expensesController.updateExpense
);
expensesRouter.delete("/records/:id", requireRole("FLEET_MANAGER"), expensesController.removeExpense);