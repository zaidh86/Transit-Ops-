import { Router } from "express";
import { auth } from "../../middleware/auth";
import * as analyticsController from "./analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.use(auth);
analyticsRouter.get("/dashboard", analyticsController.dashboard);