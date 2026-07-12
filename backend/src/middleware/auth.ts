import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Verifies the Bearer token and attaches req.user.
 * Decode-only (no DB hit) — see Module 2 architecture notes.
 */
export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized();
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as unknown as TokenPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  // Deliberately outside the try/catch so downstream errors
  // are not swallowed and mislabeled as auth failures.
  next();
}