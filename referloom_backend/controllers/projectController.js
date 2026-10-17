// referloom_backend/controllers/projectController.js
import { prisma } from "../config/prisma.js";

// @desc    Create a new Project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { title, description, tags, githubUrl, liveUrl, image } = req.body;
    const studentId = req.user.id;

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can upload projects." });
    }

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const parsedTechnologies = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : (typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : []);

    // Create project and link it to user in a transaction
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          studentId,
          title,
          description,
          technologies: parsedTechnologies,
          github: githubUrl || null,
          live: liveUrl || null,
          image: image || null,
        },
      });

      return newProject;
    });

    res.status(201).json({ message: "Project uploaded successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload project", error: error.message });
  }
};

// @desc    Update an existing project
// @route   PUT /api/projects/:id
export const updateProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Security Check: Ensure the logged-in user owns this project
    if (project.studentId !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to update this project" });
    }

    const { title, description, github, live, technologies, tags } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (github !== undefined) updateData.github = github;
    if (live !== undefined) updateData.live = live;
    if (technologies) updateData.technologies = Array.isArray(technologies) ? technologies : [technologies];
    if (tags) {
      updateData.technologies = Array.isArray(tags)
        ? tags.map(t => String(t).trim()).filter(Boolean)
        : tags.split(",").map(t => t.trim()).filter(Boolean);
    }

    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.status(200).json({ message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Project Details
// @route   GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Security Check: Ensure the logged-in user owns this project
    if (project.studentId !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this project" });
    }

    await prisma.project.delete({ where: { id: req.params.id } });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all projects for the logged-in student
// @route   GET /api/projects/my
export const getMyProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching my projects:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};