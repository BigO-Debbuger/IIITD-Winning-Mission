// referloom_backend/controllers/adminController.js
import { prisma } from "../config/prisma.js";

// @desc    Get all pending (unverified) users
// @route   GET /api/admin/pending
export const getPendingUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const users = await prisma.user.findMany({
      where: {
        isVerified: false,
        role: { not: "admin" },
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        profileImage: true,
        isVerified: true,
        isProfileComplete: true,
        headline: true,
        studentDetails: true,
        alumniDetails: true,
        companyDetails: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify a user
// @route   PUT /api/admin/verify/:id
export const verifyUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isVerified: true },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        isVerified: true,
      },
    });
    res.json({ message: "User verified", user });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};