import { Request, Response } from "express";
import * as tripService from "./trip.service";
import { parseTripListQuery } from "./trip.validation";

export async function createTrip(req: Request, res: Response): Promise<void> {
  const trip = await tripService.createTrip(req.body);
  res.status(201).json({ success: true, data: { trip } });
}

export async function listTrips(req: Request, res: Response): Promise<void> {
  const filters = parseTripListQuery(req.query);
  const trips = await tripService.listTrips(filters);
  res.json({ success: true, data: { trips, count: trips.length } });
}

export async function getTrip(req: Request, res: Response): Promise<void> {
  const trip = await tripService.getTripById(req.params.id as string);
  res.json({ success: true, data: { trip } });
}

export async function dispatchTrip(req: Request, res: Response): Promise<void> {
  const trip = await tripService.dispatchTrip(req.params.id as string);
  res.json({ success: true, data: { trip } });
}

export async function completeTrip(req: Request, res: Response): Promise<void> {
  const trip = await tripService.completeTrip(req.params.id as string, req.body);
  res.json({ success: true, data: { trip } });
}

export async function cancelTrip(req: Request, res: Response): Promise<void> {
  const trip = await tripService.cancelTrip(req.params.id as string);
  res.json({ success: true, data: { trip } });
}