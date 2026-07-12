import { MaintenanceLog, MaintenanceStatus, Prisma, VehicleStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateMaintenanceInput, UpdateMaintenanceInput } from "./maintenance.validation";

export interface MaintenanceDto {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  closedAt?: string;
}

function formatDate(date: Date | null | undefined): string | undefined {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

function toDto(log: MaintenanceLog): MaintenanceDto {
  return {
    id: log.id,
    vehicleId: log.vehicleId,
    description: log.description ?? log.title,
    cost: log.cost,
    isActive: log.status === MaintenanceStatus.OPEN,
    createdAt: formatDate(log.createdAt)!,
    closedAt: formatDate(log.closedAt),
  };
}

async function syncVehicleStatus(vehicleId: string): Promise<void> {
  const [openMaintenanceCount, vehicle] = await Promise.all([
    prisma.maintenanceLog.count({ where: { vehicleId, status: MaintenanceStatus.OPEN } }),
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
  ]);

  if (!vehicle) {
    throw ApiError.notFound("Vehicle not found");
  }

  if (vehicle.status === VehicleStatus.RETIRED) {
    return;
  }

  const nextStatus = openMaintenanceCount > 0 ? VehicleStatus.IN_SHOP : VehicleStatus.AVAILABLE;
  if (vehicle.status !== nextStatus) {
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { status: nextStatus } });
  }
}

export async function listMaintenance(): Promise<MaintenanceDto[]> {
  const logs = await prisma.maintenanceLog.findMany({ orderBy: { createdAt: "desc" } });
  return logs.map(toDto);
}

export async function createMaintenance(input: CreateMaintenanceInput): Promise<MaintenanceDto> {
  const log = await prisma.maintenanceLog.create({
    data: {
      vehicleId: input.vehicleId,
      title: input.title,
      description: input.description,
      cost: input.cost,
      status: input.status,
      closedAt: input.status === MaintenanceStatus.CLOSED ? input.closedAt ?? new Date() : null,
    },
  });

  await syncVehicleStatus(input.vehicleId);
  return toDto(log);
}

export async function updateMaintenance(
  id: string,
  input: UpdateMaintenanceInput
): Promise<MaintenanceDto> {
  const existing = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Maintenance log not found");
  }

  const nextStatus = input.status ?? existing.status;
  const log = await prisma.maintenanceLog.update({
    where: { id },
    data: {
      ...(input.vehicleId !== undefined ? { vehicleId: input.vehicleId } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.cost !== undefined ? { cost: input.cost } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      closedAt:
        nextStatus === MaintenanceStatus.CLOSED
          ? input.closedAt ?? existing.closedAt ?? new Date()
          : null,
    },
  });

  await syncVehicleStatus(log.vehicleId);
  if (input.vehicleId && input.vehicleId !== existing.vehicleId) {
    await syncVehicleStatus(existing.vehicleId);
  }

  return toDto(log);
}

export async function deleteMaintenance(id: string): Promise<void> {
  const existing = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Maintenance log not found");
  }

  await prisma.maintenanceLog.delete({ where: { id } });
  await syncVehicleStatus(existing.vehicleId);
}