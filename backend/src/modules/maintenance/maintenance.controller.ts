import { Request, Response } from "express";
import * as maintenanceService from "./maintenance.service";

function readParamId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? "";
}

export async function list(req: Request, res: Response): Promise<void> {
  const maintenanceLogs = await maintenanceService.listMaintenance();
  res.json({ success: true, data: { maintenanceLogs } });
}

export async function create(req: Request, res: Response): Promise<void> {
  const maintenanceLog = await maintenanceService.createMaintenance(req.body);
  res.status(201).json({ success: true, data: { maintenanceLog } });
}

export async function update(req: Request, res: Response): Promise<void> {
  const maintenanceLog = await maintenanceService.updateMaintenance(readParamId(req.params.id), req.body);
  res.json({ success: true, data: { maintenanceLog } });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await maintenanceService.deleteMaintenance(readParamId(req.params.id));
  res.status(204).send();
}