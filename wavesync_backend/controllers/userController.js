// wavesync_backend/controllers/userController.js
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { generateCareerRoadmap, calculateProfileStrength } from "../utils/aiEngine.js";

// Helper: Attaches real-time AI profile score to user objects
const attachAIToUser = async (userObj) => {
  const user = typeof userObj.toObject === "function" ? userObj.toObject() : userObj;

  if (user.role === "student") {
    try {
      const strengthData = await calculateProfileStrength(user);
      user.profileStrength = strengthData.score;
      user.profileSuggestions = strengthData.suggestions;
    } catch {
      user.profileStrength = 30;
      user.profileSuggestions = ["AI Engine encountered a calculation error."];
    }
  }
  return user;
};

// @desc    Get current logged in user profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { projects: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;
    res.json(await attachAIToUser(safeUser));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // UUID validation
    if (!id || id === "undefined") {
      return res.status(400).json({ message: "A valid User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { projects: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...safeUser } = user;
    res.json(await attachAIToUser(safeUser));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update Profile Details dynamically based on role
export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const updateData = {};

    // 1. Handle Image Upload to Cloudinary
    if (updates.base64Image) {
      const uploadRes = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${updates.base64Image}`,
        { folder: "wavesync_profiles" }
      );
      updateData.profileImage = uploadRes.secure_url;
    } else if (updates.profileImage !== undefined) {
      updateData.profileImage = updates.profileImage;
    }

    // 2. Handle universal fields
    if (updates.fullName) updateData.fullName = updates.fullName;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.headline !== undefined) updateData.headline = updates.headline;
    if (updates.visibilityMode) updateData.visibilityMode = updates.visibilityMode;
    if (updates.isProfileComplete !== undefined) updateData.isProfileComplete = updates.isProfileComplete;

    // 3. Handle role-specific nested JSON updates with deep merge
    if (user.role === "student") {
      const currentDetails = user.studentDetails || {};
      let mergedStudentDetails = { ...currentDetails };

      if (updates.studentDetails) {
        mergedStudentDetails = { ...mergedStudentDetails, ...updates.studentDetails };
      }
      if (updates.skills) mergedStudentDetails.skills = updates.skills;
      if (updates.experience) mergedStudentDetails.experience = updates.experience;

      updateData.studentDetails = mergedStudentDetails;
    }

    if (user.role === "alumni" && updates.alumniDetails) {
      updateData.alumniDetails = { ...(user.alumniDetails || {}), ...updates.alumniDetails };
    }

    if (user.role === "company" && updates.companyDetails) {
      updateData.companyDetails = { ...(user.companyDetails || {}), ...updates.companyDetails };
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { projects: true },
    });

    const { password, ...safeUser } = updatedUser;
    res.json({ message: "Profile updated successfully", user: await attachAIToUser(safeUser) });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update Career Preferences & Generate AI Roadmap
export const updateCareerPreferences = async (req, res) => {
  try {
    const { fields, companies, locations, jobTypes, timeline } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { projects: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const currentDetails = user.studentDetails || {};
    const updatedStudentDetails = {
      ...currentDetails,
      careerPreferences: { fields, companies, locations, jobTypes, timeline },
    };

    // Generate AI Roadmap before saving
    const roadmap = await generateCareerRoadmap({
      ...user,
      studentDetails: updatedStudentDetails,
    });
    updatedStudentDetails.aiCareerRoadmap = roadmap;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { studentDetails: updatedStudentDetails },
      include: { projects: true },
    });

    const { password, ...safeUser } = updatedUser;
    res.status(200).json({
      message: "Preferences saved and AI Roadmap generated!",
      user: await attachAIToUser(safeUser),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update preferences", error: error.message });
  }
};

// @desc    Reset Career Goals
export const resetCareerGoals = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedStudentDetails = {
      ...(user.studentDetails || {}),
      careerPreferences: {},
      aiCareerRoadmap: [],
    };

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { studentDetails: updatedStudentDetails },
      include: { projects: true },
    });

    const { password, ...safeUser } = updatedUser;
    res.json(await attachAIToUser(safeUser));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update Visibility Mode
export const updateVisibility = async (req, res) => {
  try {
    const { visibilityMode } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { visibilityMode },
      include: { projects: true },
    });

    const { password, ...safeUser } = updatedUser;
    res.json({ message: `Profile is now ${visibilityMode}`, user: await attachAIToUser(safeUser) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all completed Alumni profiles
export const getAllAlumni = async (req, res) => {
  try {
    const alumni = await prisma.user.findMany({
      where: { role: "alumni", isProfileComplete: true },
      select: {
        id: true,
        fullName: true,
        profileImage: true,
        headline: true,
        alumniDetails: true,
      },
      orderBy: { fullName: "asc" },
    });

    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alumni", error: error.message });
  }
};