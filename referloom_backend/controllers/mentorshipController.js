// referloom_backend/controllers/mentorshipController.js
import { prisma } from "../config/prisma.js";

// @desc    Get Mentorship Requests (Context-Aware: Works for both Student & Alumni)
// @route   GET /api/mentorship/requests
export const getMentorshipRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let requests;

    if (role === "student") {
      requests = await prisma.mentorship.findMany({
        where: { studentId: userId },
        include: {
          alumni: {
            select: {
              id: true,
              fullName: true,
              headline: true,
              alumniDetails: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "alumni") {
      requests = await prisma.mentorship.findMany({
        where: { alumniId: userId },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              headline: true,
              studentDetails: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return res.status(403).json({ message: "Unauthorized role for this action." });
    }

    res.json(requests);
  } catch (error) {
    console.error("Mentorship Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch requests", error: error.message });
  }
};

// @desc    Update Request Status (Alumni Accepts/Rejects)
// @route   PUT /api/mentorship/requests/:id
export const updateMentorshipStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    // Verify the request belongs to this alumni
    const request = await prisma.mentorship.findFirst({
      where: { id: req.params.id, alumniId: req.user.id },
    });

    if (!request) return res.status(404).json({ message: "Request not found or unauthorized." });

    const updated = await prisma.mentorship.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ message: `Request ${status}!`, request: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

// @desc    Send a Mentorship Request (Student -> Alumni)
// @route   POST /api/mentorship/request
export const requestMentorship = async (req, res) => {
  try {
    const { alumniId, message } = req.body;
    const studentId = req.user.id;

    if (!alumniId || !message) {
      return res.status(400).json({ message: "Alumni ID and message are required." });
    }

    const existing = await prisma.mentorship.findUnique({
      where: {
        studentId_alumniId: { studentId, alumniId },
      },
    });

    if (existing) return res.status(400).json({ message: "Request already sent." });

    const request = await prisma.mentorship.create({
      data: { studentId, alumniId, message },
    });

    res.status(201).json({ message: "Mentorship request sent!", request });
  } catch (error) {
    res.status(500).json({ message: "Failed to send request", error: error.message });
  }
};