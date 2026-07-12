import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import {
  CreateExpenseInput,
  CreateFuelLogInput,
  UpdateExpenseInput,
  UpdateFuelLogInput,
} from "./expenses.validation";

export interface FuelLogDto {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
}

export interface ExpenseDto {
  id: string;
  vehicleId: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}

function fuelLogToDto(log: {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: Date;
}): FuelLogDto {
  return {
    id: log.id,
    vehicleId: log.vehicleId,
    liters: log.liters,
    cost: log.cost,
    date: formatDate(log.date),
  };
}

function expenseToDto(expense: {
  id: string;
  vehicleId: string;
  type: string;
  amount: number;
  date: Date;
  description: string | null;
}): ExpenseDto {
  return {
    id: expense.id,
    vehicleId: expense.vehicleId,
    category: expense.type.replace(/_/g, " "),
    amount: expense.amount,
    date: formatDate(expense.date),
    notes: expense.description ?? undefined,
  };
}

async function ensureVehicle(vehicleId: string): Promise<void> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw ApiError.notFound("Vehicle not found");
  }
}

export async function listFuelLogs(): Promise<FuelLogDto[]> {
  const fuelLogs = await prisma.fuelLog.findMany({ orderBy: { date: "desc" } });
  return fuelLogs.map(fuelLogToDto);
}

export async function listExpenses(): Promise<ExpenseDto[]> {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" } });
  return expenses.map(expenseToDto);
}

export async function getExpenseModule(): Promise<{
  fuelLogs: FuelLogDto[];
  expenses: ExpenseDto[];
}> {
  const [fuelLogs, expenses] = await Promise.all([listFuelLogs(), listExpenses()]);
  return { fuelLogs, expenses };
}

export async function createFuelLog(input: CreateFuelLogInput): Promise<FuelLogDto> {
  await ensureVehicle(input.vehicleId);
  const fuelLog = await prisma.fuelLog.create({
    data: {
      vehicleId: input.vehicleId,
      tripId: input.tripId,
      liters: input.liters,
      cost: input.cost,
      date: input.date,
    },
  });
  return fuelLogToDto(fuelLog);
}

export async function updateFuelLog(
  id: string,
  input: UpdateFuelLogInput
): Promise<FuelLogDto> {
  if (input.vehicleId) {
    await ensureVehicle(input.vehicleId);
  }
  try {
    const fuelLog = await prisma.fuelLog.update({
      where: { id },
      data: {
        ...(input.vehicleId !== undefined ? { vehicleId: input.vehicleId } : {}),
        ...(input.tripId !== undefined ? { tripId: input.tripId } : {}),
        ...(input.liters !== undefined ? { liters: input.liters } : {}),
        ...(input.cost !== undefined ? { cost: input.cost } : {}),
        ...(input.date !== undefined ? { date: input.date } : {}),
      },
    });
    return fuelLogToDto(fuelLog);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw ApiError.notFound("Fuel log not found");
    }
    throw error;
  }
}

export async function deleteFuelLog(id: string): Promise<void> {
  try {
    await prisma.fuelLog.delete({ where: { id } });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw ApiError.notFound("Fuel log not found");
    }
    throw error;
  }
}

export async function createExpense(input: CreateExpenseInput): Promise<ExpenseDto> {
  await ensureVehicle(input.vehicleId);
  const expense = await prisma.expense.create({
    data: {
      vehicleId: input.vehicleId,
      type: input.type,
      amount: input.amount,
      description: input.description,
      date: input.date,
    },
  });
  return expenseToDto(expense);
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<ExpenseDto> {
  if (input.vehicleId) {
    await ensureVehicle(input.vehicleId);
  }
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(input.vehicleId !== undefined ? { vehicleId: input.vehicleId } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.date !== undefined ? { date: input.date } : {}),
      },
    });
    return expenseToDto(expense);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw ApiError.notFound("Expense not found");
    }
    throw error;
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await prisma.expense.delete({ where: { id } });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw ApiError.notFound("Expense not found");
    }
    throw error;
  }
}