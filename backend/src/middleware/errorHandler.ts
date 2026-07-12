import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.originalUrl} not found` },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Errors we threw deliberately (business rules, validation, auth)
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Known Prisma errors mapped to meaningful HTTP responses
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(", ")
        : "field";
      res.status(409).json({
        success: false,
        error: { message: `A record with this ${target} already exists` },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        error: { message: "Resource not found" },
      });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({
        success: false,
        error: { message: "Invalid reference to a related record" },
      });
      return;
    }
  }

  // Anything unexpected: log it, hide internals outside development
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: {
      message:
        env.nodeEnv === "development" && err instanceof Error
          ? err.message
          : "Internal server error",
    },
  });
}