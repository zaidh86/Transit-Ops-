import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import * as tripController from "./trip.controller";
import { completeTripSchema, createTripSchema } from "./trip.validation";

export const tripRouter = Router();

// Every trip route requires authentication.
tripRouter.use(auth);

// Reads: any authenticated user.
tripRouter.get("/", tripController.listTrips);
tripRouter.get("/:id", tripController.getTrip);

// Writes: Driver (dispatcher persona) and Fleet Manager — RBAC matrix, Module 2.
tripRouter.post(
  "/",
  requireRole("DRIVER", "FLEET_MANAGER"),
  validate(createTripSchema),
  tripController.createTrip
);

tripRouter.patch(
  "/:id/dispatch",
  requireRole("DRIVER", "FLEET_MANAGER"),
  tripController.dispatchTrip
);

tripRouter.patch(
  "/:id/complete",
  requireRole("DRIVER", "FLEET_MANAGER"),
  validate(completeTripSchema),
  tripController.completeTrip
);

tripRouter.patch(
  "/:id/cancel",
  requireRole("DRIVER", "FLEET_MANAGER"),
  tripController.cancelTrip
);