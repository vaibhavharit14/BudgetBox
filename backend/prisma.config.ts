import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// ✅ Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL as string, // type-safe env var
    },
  },
});

export default prisma;