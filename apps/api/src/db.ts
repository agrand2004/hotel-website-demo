import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

/** Shared Prisma client for the API process. */
export const prisma = new PrismaClient({ adapter });
