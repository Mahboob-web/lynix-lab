// Prisma 7 configuration. Prisma no longer loads .env automatically, so dotenv does it here.
// In production (Hostinger) the variables come from hPanel → Environment variables.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations should use a direct (non-pooled) connection when your provider offers one.
    // `prisma generate` doesn't connect, so a placeholder is fine during builds without DB access.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
