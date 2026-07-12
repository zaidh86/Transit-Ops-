import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "@prisma/client";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { LoginInput, RegisterInput } from "./auth.validation";

export type SafeUser = Omit<User, "password">;

function sanitize(user: User): SafeUser {
  const { password: _password, ...safe } = user;
  return safe;
}

function signToken(user: User): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    env.jwtSecret,
    options
  );
}

export async function registerUser(
  input: RegisterInput
): Promise<{ token: string; user: SafeUser }> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  // Duplicate email throws Prisma P2002 → errorHandler maps it to 409.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: passwordHash,
      role: input.role,
    },
  });

  return { token: signToken(user), user: sanitize(user) };
}

export async function loginUser(
  input: LoginInput
): Promise<{ token: string; user: SafeUser }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  // Same message for both failure modes: prevents user enumeration.
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  return { token: signToken(user), user: sanitize(user) };
}

export async function getUserById(id: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return sanitize(user);
}