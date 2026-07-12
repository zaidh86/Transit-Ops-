import { Request, Response } from "express";
import * as vehicleService from "./vehicle.service";
import { parseVehicleListQuery } from "./vehicle.validation";

export async function createVehicle(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(201).json({ success: true, data: { vehicle } });
}

export async function listVehicles(req: Request, res: Response): Promise<void> {
  const filters = parseVehicleListQuery(req.query);
  const vehicles = await vehicleService.listVehicles(filters);
  res.json({ success: true, data: { vehicles, count: vehicles.length } });
}

export async function getVehicle(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.getVehicleById(req.params.id as string);
  res.json({ success: true, data: { vehicle } });
}

export async function updateVehicle(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.updateVehicle(req.params.id as string, req.body);
  res.json({ success: true, data: { vehicle } });
}

export async function deleteVehicle(req: Request, res: Response): Promise<void> {
  await vehicleService.deleteVehicle(req.params.id as string);
  res.json({ success: true, data: { message: "Vehicle deleted successfully" } });
}