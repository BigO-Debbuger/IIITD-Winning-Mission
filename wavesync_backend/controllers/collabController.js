// wavesync_backend/controllers/collabController.js
import { prisma } from "../config/prisma.js";

// @desc    Create a new Collab Post
export const createPost = async (req, res) => {
  try {
    const { type, title, description, roles, skillsRequired, projectStage } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const postType = type || projectStage || "Project";
    const rawRoles = roles || skillsRequired || [];
    const parsedRoles = Array.isArray(rawRoles) ? rawRoles : (typeof rawRoles === "string" ? [rawRoles] : []);

    const post = await prisma.collabPost.create({
      data: {
        authorId: req.user.id,
        type: postType,
        title,
        description,
        roles: parsedRoles,
      },
      include: {
        author: {
          select: { id: true, fullName: true, role: true, profileImage: true },
        },
      },
    });

    res.status(201).json({
      ...post,
      projectStage: post.type,
      skillsRequired: post.roles,
      status: post.isActive ? "active" : "inactive",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All ACTIVE Posts (For the Explore Feed)
export const getActivePosts = async (req, res) => {
  try {
    let posts = await prisma.collabPost.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: { id: true, fullName: true, role: true, profileImage: true },
        },
        applicants: {
          include: {
            student: {
              select: { id: true, fullName: true, role: true, profileImage: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (posts.length === 0) {
      let partner = await prisma.user.findFirst({
        where: { role: { in: ["company", "alumni", "admin"] } },
      });

      if (!partner) {
        partner = await prisma.user.create({
          data: {
            email: "foundation@wavesync.io",
            password: "dev_placeholder_hash_not_for_login",
            fullName: "HyperState & WaveSync Labs",
            role: "company",
            isVerified: true,
            isProfileComplete: true,
            headline: "Ecosystem Incubator & Protocol Lab",
            bio: "Accelerating verified founders and systems engineers across distributed state, cryptography, and WebGL.",
            companyDetails: {
              companyName: "HyperState Labs",
              industry: "Developer Infrastructure",
              website: "https://wavesync.io",
              skills: ["Rust", "PostgreSQL", "Raft Consensus", "P2P Networking", "Operations", "Fundraising"],
            },
          },
        });
      }

      await prisma.collabPost.createMany({
        data: [
          {
            authorId: partner.id,
            type: "Prototype Stage",
            title: "WaveMesh — Peer-to-Peer Verified Compute Layer",
            description: "Seeking a systems co-founder to co-build decentralized verifiable proof execution for low-latency nodes.",
            roles: ["Rust", "Wasm", "Distributed Systems", "P2P Networking"],
            isActive: true,
          },
          {
            authorId: partner.id,
            type: "Grant-Funded",
            title: "ZeroBio — Open Synthetic Biology Repository",
            description: "Looking for a frontend craftsperson to turn bio-computational graphs into fluid interactive canvases.",
            roles: ["TypeScript", "Three.js", "Canvas API", "Bioinformatics"],
            isActive: true,
          },
        ],
      });

      posts = await prisma.collabPost.findMany({
        where: { isActive: true },
        include: {
          author: {
            select: { id: true, fullName: true, role: true, profileImage: true },
          },
          applicants: {
            include: {
              student: {
                select: { id: true, fullName: true, role: true, profileImage: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    const formatted = posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      projectStage: post.type,
      skillsRequired: post.roles,
      status: post.isActive ? "active" : "inactive",
      author: post.author,
      applicants: post.applicants,
      createdAt: post.createdAt,
    }));

    res.json(formatted);
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
              select: { id: true, fullName: true, role: true, profileImage: true },
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

// @desc    Toggle Collab Post Status (Active/Inactive)
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.collabPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to change status of this post." });
    }

    const updated = await prisma.collabPost.update({
      where: { id },
      data: { isActive: !post.isActive },
    });

    res.json({ message: `Post marked as ${updated.isActive ? "Active" : "Inactive"}.`, post: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply to a Collab Post
export const applyToPost = async (req, res) => {
  try {
    const { id: collabPostId } = req.params;
    const { role, message } = req.body;
    const studentId = req.user.id;

    // Verify post exists
    const post = await prisma.collabPost.findUnique({
      where: { id: collabPostId },
    });

    if (!post) {
      return res.status(404).json({ message: "Venture or project not found." });
    }

    // Check if user already applied
    const existing = await prisma.collabApplicant.findUnique({
      where: {
        collabPostId_studentId: {
          collabPostId,
          studentId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "You have already applied to this team." });
    }

    const application = await prisma.collabApplicant.create({
      data: {
        collabPostId,
        studentId,
        role: role || "Contributor",
        message: message || "",
      },
    });

    res.status(201).json({ message: "Collaboration request submitted successfully!", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};