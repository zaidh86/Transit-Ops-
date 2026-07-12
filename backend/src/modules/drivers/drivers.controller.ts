import { Request, Response } from "express";
import * as driversService from "./drivers.service";

function readParamId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? "";
}

export async function list(req: Request, res: Response): Promise<void> {
  const drivers = await driversService.listDrivers();
  res.json({ success: true, data: { drivers } });
}

export async function create(req: Request, res: Response): Promise<void> {
  const driver = await driversService.createDriver(req.body);
  res.status(201).json({ success: true, data: { driver } });
}

export async function update(req: Request, res: Response): Promise<void> {
  const driver = await driversService.updateDriver(readParamId(req.params.id), req.body);
  res.json({ success: true, data: { driver } });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await driversService.deleteDriver(readParamId(req.params.id));
  res.status(204).send();
}