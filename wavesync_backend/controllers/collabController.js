// wavesync_backend/controllers/collabController.js
import { prisma } from "../config/prisma.js";

// @desc    Create a new Collab Post
export const createPost = async (req, res) => {
  try {
    const { type, title, description, roles } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({ message: "Type, title, and description are required." });
    }

    const parsedRoles = Array.isArray(roles) ? roles : (typeof roles === "string" ? [roles] : []);

    const post = await prisma.collabPost.create({
      data: {
        authorId: req.user.id,
        type,
        title,
        description,
        roles: parsedRoles,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All ACTIVE Posts (For the Explore Feed)
export const getActivePosts = async (req, res) => {
  try {
    const posts = await prisma.collabPost.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: { id: true, fullName: true, profileImage: true },
        },
        applicants: {
          include: {
            student: {
              select: { id: true, fullName: true, profileImage: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get My Posts (Includes applicants)
export const getMyPosts = async (req, res) => {
  try {
    const posts = await prisma.collabPost.findMany({
      where: { authorId: req.user.id },
      include: {
        applicants: {
          include: {
            student: {
              select: { id: true, fullName: true, profileImage: true, studentDetails: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Active Status
export const toggleStatus = async (req, res) => {
  try {
    const post = await prisma.collabPost.findFirst({
      where: { id: req.params.id, authorId: req.user.id },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const updated = await prisma.collabPost.update({
      where: { id: req.params.id },
      data: { isActive: !post.isActive },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply to a Post
export const applyToPost = async (req, res) => {
  try {
    const { role, message } = req.body;
    const collabPostId = req.params.id;
    const studentId = req.user.id;

    const post = await prisma.collabPost.findUnique({ where: { id: collabPostId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Prevent duplicate apply via unique constraint
    const existing = await prisma.collabApplicant.findUnique({
      where: {
        collabPostId_studentId: { collabPostId, studentId },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "You already applied to this team." });
    }

    await prisma.collabApplicant.create({
      data: { collabPostId, studentId, role, message },
    });

    res.json({ message: "Applied successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};