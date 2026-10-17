// wavesync_backend/addTestUser.js
// Utility script to add a test admin user directly to PostgreSQL via Prisma.
// Usage: node addTestUser.js
// Requires DATABASE_URL to be set in .env
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const addTestUser = async () => {
  try {
    const email = "testadmin@wavesync.com";
    const password = "Admin@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("Test user already exists:", email);
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "admin",
        fullName: "Test Admin",
        isVerified: true,
        isProfileComplete: true,
      },
    });

    console.log("✅ Test admin user created:", user.email);
  } catch (error) {
    console.error("❌ Error creating test user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};

addTestUser();
