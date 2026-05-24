import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton for Next.js
 * Prevents multiple instances in development due to Hot Module Replacement (HMR).
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}