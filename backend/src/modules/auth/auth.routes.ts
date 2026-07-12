import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as authController from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  authController.register
);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.get("/me", auth, authController.me);