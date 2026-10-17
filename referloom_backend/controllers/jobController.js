// referloom_backend/controllers/jobController.js
import { prisma } from "../config/prisma.js";
import { 
  calculateJobMatch, 
  calculateJobMatchDeepInsight, 
  calculateDeterministicJobMatch 
} from "../utils/aiEngine.js";

// @desc    Create a new Job Posting (Company or Alumni)
export const createJob = async (req, res) => {
  try {
    if (req.user.role !== "company" && req.user.role !== "alumni") {
      return res.status(403).json({ message: "Only companies and alumni can post jobs." });
    }

    const { title, description, jobType, location, salaryRange, requirements } = req.body;

    if (!title || !description || !jobType) {
      return res.status(400).json({ message: "Title, description, and job type are required." });
    }

    // Determine companyName from user profile if not provided by client
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    let companyName = req.body.companyName;
    if (!companyName || typeof companyName !== "string" || companyName.trim() === "") {
      if (req.user.role === "company") {
        companyName = user?.companyDetails?.companyName || user?.fullName;
      } else if (req.user.role === "alumni") {
        companyName = user?.alumniDetails?.company || user?.fullName;
      }
    }

    if (!companyName || companyName.trim() === "") {
      companyName = user?.fullName || "Hiring Partner";
    }

    // Normalize jobType to match schema enum
    const validJobTypes = [
      "Full-Time", "Internship", "Summer Internship", "6-Month Internship", "Contract / Freelance", "Full-Time Role"
    ];
    let normalizedJobType = jobType;
    const foundType = validJobTypes.find(t => t.toLowerCase() === jobType.toLowerCase().trim());
    if (foundType) {
      normalizedJobType = foundType;
    }

    const parsedRequirements = Array.isArray(requirements) 
      ? requirements.map(r => String(r).trim()).filter(Boolean)
      : (typeof requirements === "string" ? requirements.split(",").map(r => r.trim()).filter(Boolean) : []);

    const job = await prisma.job.create({
      data: {
        postedById: req.user.id,
        title: title.trim(),
        companyName: companyName.trim(),
        description: description.trim(),
        requirements: parsedRequirements,
        jobType: normalizedJobType,
        location: location || "Remote",
        salaryRange: salaryRange || "",
        status: "open", // Enforces lowercase 'open'
      },
    });

    res.status(201).json({ message: "Job posted successfully!", job });
  } catch (error) {
    console.error("Job creation error:", error.message);
    res.status(500).json({ message: "Failed to post job", error: error.message });
  }
};

// @desc    Get Applicants for Jobs posted by this Alumni
export const getAlumniApplicants = async (req, res) => {
  try {
    const applicants = await prisma.application.findMany({
      where: {
        job: {
          postedById: req.user.id,
        },
      },
      include: {
        student: {
          select: { id: true, fullName: true, profileImage: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Failed to fetch applicants", error: error.message });
  }
};

// @desc    Get single job details & generate dynamic AI match insights
export const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        postedBy: {
          select: { id: true, fullName: true, companyDetails: true, profileImage: true },
        },
      },
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    let fitScore = 0;
    let aiSuggestions = [];

    // Trigger deterministic match with optional Gemini deep insight if student
    if (req.user && req.user.role === "student") {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { projects: true },
      });
      const aiAnalysis = await calculateJobMatchDeepInsight(user, job);
      fitScore = aiAnalysis.fitScore;
      aiSuggestions = aiAnalysis.suggestions;
    }

    res.status(200).json({
      ...job,
      companyName: job.companyName || job.postedBy?.companyDetails?.companyName || job.postedBy?.fullName,
      fitScore,
      aiSuggestions,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
};

// @desc    Get matching jobs for student dashboard (Fast, Deterministic, 0-Latency)
export const getStudentMatches = async (req, res) => {
  try {
    const whereClause = { status: "open" };

    if (req.query.jobType) {
      whereClause.jobType = {
        equals: req.query.jobType,
        mode: "insensitive",
      };
    }
    if (req.query.location) {
      whereClause.location = {
        contains: req.query.location,
        mode: "insensitive",
      };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        postedBy: {
          select: { id: true, fullName: true, companyDetails: true, profileImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { projects: true },
    });

    // Fast deterministic matching in-memory with explainable factors
    const matchedJobs = jobs.map((job) => {
      const match = calculateDeterministicJobMatch(user, job);
      return {
        ...job,
        companyName: job.companyName || job.postedBy?.companyDetails?.companyName || job.postedBy?.fullName,
        fitScore: match.fitScore,
        aiSuggestions: match.suggestions,
      };
    });

    // Sort by highest match first
    matchedJobs.sort((a, b) => b.fitScore - a.fitScore);

    res.json(matchedJobs);
  } catch (error) {
    console.error("Match error:", error.message);
    res.status(500).json({ message: "Failed to fetch matches", error: error.message });
  }
};

// @desc    Apply to a Job
export const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user.id;

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can apply for jobs." });
    }

    const existingApp = await prisma.application.findUnique({
      where: {
        jobId_studentId: { jobId, studentId },
      },
    });

    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this role." });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { projects: true },
    });

    const aiAnalysis = await calculateJobMatch(student, job);

    const application = await prisma.application.create({
      data: {
        jobId,
        studentId,
        fitScore: aiAnalysis.fitScore,
        status: "applied",
      },
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Apply Error:", error);
    res.status(500).json({ message: "Failed to apply", error: error.message });
  }
};

// @desc    Get all applicants across all jobs posted by the logged-in user (Alumni/Company)
export const getMyApplicants = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        job: {
          postedById: req.user.id,
        },
      },
      include: {
        student: {
          select: { id: true, fullName: true, headline: true, studentDetails: true, profileImage: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
      orderBy: { fitScore: "desc" },
    });

    const formattedApps = applications.map((app) => ({
      ...app,
      jobTitle: app.job ? app.job.title : "Unknown Role",
    }));

    res.json(formattedApps);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applicants", error: error.message });
  }
};

// @desc    Update Candidate Application Stage (ATS Pipeline)
export const updateApplicationStage = async (req, res) => {
  try {
    const { status } = req.body;
    const { appId } = req.params;

    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Only companies can update application stages." });
    }

    const validStatuses = ["applied", "shortlisted", "interviewing", "offered", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${validStatuses.join(", ")}` });
    }

    const application = await prisma.application.findUnique({
      where: { id: appId },
      include: { job: true },
    });

    if (!application) return res.status(404).json({ message: "Application not found." });

    if (!application.job || application.job.postedById !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this application." });
    }

    const updatedApp = await prisma.application.update({
      where: { id: appId },
      data: { status },
    });

    res.json({ message: `Candidate moved to ${status}`, application: updatedApp });
  } catch (error) {
    res.status(500).json({ message: "Failed to update stage", error: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { studentId: req.user.id },
      include: {
        job: {
          include: {
            postedBy: {
              select: { fullName: true, companyDetails: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications", error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await prisma.application.findFirst({
      where: { id: req.params.id, studentId: req.user.id },
    });

    if (!application) return res.status(404).json({ message: "Application not found" });

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ message: `Offer ${status} successfully!`, application: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

export const getCompanyJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { postedById: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyApplicants = async (req, res) => {
  try {
    const applicants = await prisma.application.findMany({
      where: {
        job: {
          postedById: req.user.id,
        },
      },
      include: {
        student: {
          select: { id: true, fullName: true, profileImage: true, studentDetails: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatusATS = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });

    if (!application) return res.status(404).json({ message: "Application not found" });

    if (!application.job || application.job.postedById !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this application" });
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ message: `Candidate moved to ${status}`, application: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { postedById: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// @desc    Find high-match students for a specific job (Fast Deterministic)
export const getJobMatchesForAlumni = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedById !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to view matches for this role." });
    }

    const students = await prisma.user.findMany({
      where: { role: "student", isProfileComplete: true },
      include: { projects: true },
    });

    // Fast in-memory matching
    const analyzedStudents = students.map((student) => {
      const analysis = calculateDeterministicJobMatch(student, job);
      return {
        student,
        fitScore: analysis.fitScore,
        suggestions: analysis.suggestions,
      };
    });

    const matches = analyzedStudents.filter((m) => m.fitScore >= 60);
    matches.sort((a, b) => b.fitScore - a.fitScore);

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch matches", error: error.message });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const cleanStatus = status ? status.toLowerCase() : "";
    if (!cleanStatus || !["open", "closed"].includes(cleanStatus)) {
      return res.status(400).json({ message: "Job status must be 'open' or 'closed'" });
    }

    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedById !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: { status: cleanStatus },
    });

    res.json({ message: "Job status updated", job: updatedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};