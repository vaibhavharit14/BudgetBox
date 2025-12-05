import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  datasource: {
    db: {
      provider: "postgresql",
      url: process.env.DATABASE_URL!,   // 👈 direct url
    },
  },
  generators: {
    client: {
      provider: "prisma-client-js",
      output: "./src/generated/prisma",
    },
  },
});