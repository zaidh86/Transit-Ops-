import { Request, Response } from "express";
import * as expensesService from "./expenses.service";

function readParamId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? "";
}

export async function list(req: Request, res: Response): Promise<void> {
  const { fuelLogs, expenses } = await expensesService.getExpenseModule();
  res.json({ success: true, data: { fuelLogs, expenses } });
}

export async function createFuelLog(req: Request, res: Response): Promise<void> {
  const fuelLog = await expensesService.createFuelLog(req.body);
  res.status(201).json({ success: true, data: { fuelLog } });
}

export async function updateFuelLog(req: Request, res: Response): Promise<void> {
  const fuelLog = await expensesService.updateFuelLog(readParamId(req.params.id), req.body);
  res.json({ success: true, data: { fuelLog } });
}

export async function removeFuelLog(req: Request, res: Response): Promise<void> {
  await expensesService.deleteFuelLog(readParamId(req.params.id));
  res.status(204).send();
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  const expense = await expensesService.createExpense(req.body);
  res.status(201).json({ success: true, data: { expense } });
}

export async function updateExpense(req: Request, res: Response): Promise<void> {
  const expense = await expensesService.updateExpense(readParamId(req.params.id), req.body);
  res.json({ success: true, data: { expense } });
}

export async function removeExpense(req: Request, res: Response): Promise<void> {
  await expensesService.deleteExpense(readParamId(req.params.id));
  res.status(204).send();
}