import { Driver, Prisma, DriverStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateDriverInput, UpdateDriverInput } from "./drivers.validation";

export interface DriverDto {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
}

function toDto(driver: Driver): DriverDto {
  return {
    id: driver.id,
    name: driver.name,
    licenseNumber: driver.licenseNumber,
    licenseCategory: driver.licenseCategory,
    licenseExpiryDate: driver.licenseExpiry.toISOString().slice(0, 10),
    contactNumber: driver.contactNumber,
    safetyScore: driver.safetyScore,
    status: driver.status,
  };
}

export async function listDrivers(): Promise<DriverDto[]> {
  const drivers = await prisma.driver.findMany({ orderBy: { createdAt: "desc" } });
  return drivers.map(toDto);
}

export async function createDriver(input: CreateDriverInput): Promise<DriverDto> {
  const driver = await prisma.driver.create({
    data: {
      name: input.name,
      licenseNumber: input.licenseNumber,
      licenseCategory: input.licenseCategory,
      licenseExpiry: input.licenseExpiryDate,
      contactNumber: input.contactNumber,
      safetyScore: input.safetyScore,
      status: input.status,
    },
  });
  return toDto(driver);
}

export async function updateDriver(
  id: string,
  input: UpdateDriverInput
): Promise<DriverDto> {
  try {
    const driver = await prisma.driver.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.licenseNumber !== undefined ? { licenseNumber: input.licenseNumber } : {}),
        ...(input.licenseCategory !== undefined ? { licenseCategory: input.licenseCategory } : {}),
        ...(input.licenseExpiryDate !== undefined ? { licenseExpiry: input.licenseExpiryDate } : {}),
        ...(input.contactNumber !== undefined ? { contactNumber: input.contactNumber } : {}),
        ...(input.safetyScore !== undefined ? { safetyScore: input.safetyScore } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
    return toDto(driver);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw ApiError.notFound("Driver not found");
    }
    throw error;
  }
}

export async function deleteDriver(id: string): Promise<void> {
  try {
    await prisma.driver.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw ApiError.notFound("Driver not found");
    }
    throw error;
  }
}