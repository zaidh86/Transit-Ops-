import { Request, Response } from "express";
import * as authService from "./auth.service";

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.loginUser(req.body);
  res.json({ success: true, data: result });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getUserById(req.user!.id);
  res.json({ success: true, data: { user } });
}