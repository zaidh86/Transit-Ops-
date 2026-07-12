import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Validates req.body against a Zod schema.
 * On failure: 400 with field-level details in the standard envelope.
 * On success: replaces req.body with the parsed (typed, coerced) data.
 */
export function validate(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));
      throw ApiError.badRequest("Validation failed", details);
    }
    req.body = result.data;
    next();
  };
}