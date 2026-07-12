import { NextFunction, Request, RequestHandler, Response } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Role guard factory. Mount AFTER auth.
 * Usage: router.post("/", auth, requireRole("FLEET_MANAGER"), handler)
 */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Requires one of the following roles: ${roles.join(", ")}`
      );
    }
    next();
  };
}