// referloom_backend/controllers/authController.js
import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  return process.env.JWT_SECRET || "referloom_dev_fallback_secret_key_32chars";
};

export const register = async (req, res) => {
  try {
    const { email, password, role, fullName, ...roleSpecificData } = req.body;

    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ success: false, message: "Email, password, role, and full name are required." });
    }

    const validRoles = ["student", "alumni", "company", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Allowed roles are: ${validRoles.join(", ")}` });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email." });
    }

    // Check if the user successfully completed OTP verification prior to registration
    const verifiedOtp = await prisma.otp.findFirst({
      where: { email: cleanEmail, isVerified: true },
    });
    const isVerified = Boolean(verifiedOtp);

    const hashedPassword = await bcrypt.hash(password, 10);

    let studentDetails = null;
    let alumniDetails = null;
    let companyDetails = null;

    if (role === "student") {
      studentDetails = {
        course: roleSpecificData.course || "",
        semester: roleSpecificData.semester || "",
        university: roleSpecificData.university || "Navrachana University",
        skills: Array.isArray(roleSpecificData.skills) ? roleSpecificData.skills : [],
        experience: Array.isArray(roleSpecificData.experience) ? roleSpecificData.experience : [],
        careerPreferences: roleSpecificData.careerPreferences || {},
        aiCareerRoadmap: roleSpecificData.aiCareerRoadmap || [],
      };
    } else if (role === "alumni") {
      alumniDetails = {
        graduationYear: roleSpecificData.graduationYear || "",
        company: roleSpecificData.company || "",
        role: roleSpecificData.jobRole || "",
        degreeProof: roleSpecificData.degreeProof || "",
      };
    } else if (role === "company") {
      companyDetails = {
        companyName: roleSpecificData.companyName || fullName.trim(),
        hrContact: roleSpecificData.hrContact || "",
        industryType: roleSpecificData.industryType || "",
        website: roleSpecificData.website || "",
        description: roleSpecificData.description || "",
      };
    }

    // Execute user creation and OTP cleanup in a database transaction
    const user = await prisma.$transaction(async (tx) => {
      if (verifiedOtp) {
        await tx.otp.deleteMany({ where: { email: cleanEmail } });
      }

      return tx.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          role,
          fullName: fullName.trim(),
          isVerified,
          studentDetails: studentDetails || undefined,
          alumniDetails: alumniDetails || undefined,
          companyDetails: companyDetails || undefined,
        },
        include: {
          projects: true,
        },
      });
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...safeUser } = user;

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        projects: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        unverifiedEmail: user.email,
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    // Strip password from returned user object
    const { password: _, ...safeUser } = user;

    res.json({
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};