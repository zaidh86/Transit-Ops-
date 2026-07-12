import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";

export async function dashboard(_req: Request, res: Response): Promise<void> {
  const kpis = await analyticsService.getDashboardKpis();
  res.json({ success: true, data: kpis });
}

export async function fleetSummary(req: Request, res: Response): Promise<void> {
  const fleet = await analyticsService.getFleetSummary();

  if (req.query.format === "csv") {
    const csv = analyticsService.fleetSummaryToCsv(fleet);
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header(
      "Content-Disposition",
      'attachment; filename="fleet-summary.csv"'
    );
    res.send(csv);
    return;
  }

  res.json({ success: true, data: { fleet, count: fleet.length } });
}

export async function vehicleRoi(_req: Request, res: Response): Promise<void> {
  const vehicles = await analyticsService.getVehicleRoi();
  res.json({ success: true, data: { vehicles, count: vehicles.length } });
}