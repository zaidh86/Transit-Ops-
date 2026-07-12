import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";

export async function dashboard(_req: Request, res: Response): Promise<void> {
  const kpis = await analyticsService.getDashboardKpis();
  res.json({ success: true, data: kpis });
}