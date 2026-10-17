// referloom_backend/controllers/referralController.js
import { prisma } from "../config/prisma.js";

// @desc    Refer a Candidate (Alumni -> Company ATS)
// @route   POST /api/referrals/refer
export const referCandidate = async (req, res) => {
  try {
    const { studentId, jobId } = req.body;
    const alumniId = req.user.id;

    if (req.user.role !== "alumni") {
      return res.status(403).json({ message: "Only alumni can refer candidates." });
    }

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    // SCENARIO 1: Referral to a specific Job Posting
    if (jobId) {
      const existingApp = await prisma.application.findUnique({
        where: {
          jobId_studentId: { jobId, studentId },
        },
      });

      if (existingApp) {
        if (!existingApp.isReferral) {
          // Upgrade existing application to a referral
          const upgraded = await prisma.application.update({
            where: { id: existingApp.id },
            data: { isReferral: true, referredById: alumniId },
          });

          // Persist a formal Referral record
          await prisma.referral.create({
            data: { alumniId, studentId, jobId },
          }).catch(() => {}); // Non-fatal if duplicate referral record exists

          return res.json({
            message: "Candidate's existing application was upgraded to a Referral!",
            application: upgraded,
          });
        }
        return res.status(400).json({ message: "Candidate has already been referred to this job." });
      }

      // Verify job exists
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) {
        return res.status(404).json({ message: "Job not found." });
      }

      // Create a brand new Application injected into the HR pipeline as a referral
      const [application] = await prisma.$transaction([
        prisma.application.create({
          data: {
            jobId,
            studentId,
            isReferral: true,
            referredById: alumniId,
            status: "applied",
            fitScore: 85, // Referrals receive a baseline premium score
          },
        }),
        prisma.referral.create({
          data: {
            alumniId,
            studentId,
            jobId,
            companyName: job.companyName,
            status: "referred",
          },
        }),
      ]);

      return res.status(201).json({
        message: "Candidate successfully referred to the specific job!",
        application,
      });
    }

    // SCENARIO 2: General Referral (No specific job - persist as a general referral record)
    await prisma.referral.create({
      data: {
        alumniId,
        studentId,
        notes: "General referral - no specific job posting",
        status: "referred",
      },
    });

    res.status(201).json({ message: "Candidate referral noted and sent to your HR team!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to process referral", error: error.message });
  }
};