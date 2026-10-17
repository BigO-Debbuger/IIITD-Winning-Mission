// referloom_backend/config/prisma.js
import { PrismaClient } from "@prisma/client";

// Global singleton pattern to prevent multiple PrismaClient instances during hot reloading
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const connectDB = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ [FATAL CONFIG ERROR] DATABASE_URL is not defined in environment variables.");
    console.error("👉 Please create a .env file (see .env.example) and set DATABASE_URL for PostgreSQL.");
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw new Error("DATABASE_URL not configured");
  }

  try {
    // Validate connection by executing a lightweight query
    await prisma.$queryRaw`SELECT 1;`;
    console.log("✅ PostgreSQL Connected Successfully via Prisma");
  } catch (err) {
    // Mask sensitive connection strings if present in the error message
    const sanitizedError = err.message.replace(/postgresql:\/\/[^@]+@/gi, "postgresql://***:***@");
    console.error("❌ PostgreSQL Connection Error:", sanitizedError);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw new Error(sanitizedError);
  }
};

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("🔌 Prisma connection closed gracefully.");
  } catch (err) {
    console.error("Error disconnecting Prisma:", err.message);
  }
};

// Graceful shutdown handling
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});

export default prisma;
