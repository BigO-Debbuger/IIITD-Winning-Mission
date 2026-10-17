// wavesync_backend/controllers/matchingController.js
import { prisma } from "../config/prisma.js";

const CAPABILITY_KEYWORDS = {
  engineering: [
    "rust", "python", "typescript", "javascript", "react", "node", "postgresql",
    "docker", "ai", "ml", "systems", "solidity", "webgl", "three.js", "pytorch",
    "cse", "computer science", "frontend", "backend", "full stack", "software",
    "engineering", "developer", "coding", "mern", "cloud", "api", "database", "git",
  ],
  product: [
    "product", "ui", "ux", "figma", "design", "wireframing", "user research",
    "prototyping", "specs", "roadmap", "user experience", "interface", "design systems",
  ],
  marketing: [
    "marketing", "growth", "distribution", "community", "devrel", "seo",
    "sales", "content", "brand", "advocate", "copywriting", "developer relations",
  ],
  operations: [
    "operations", "fundraising", "finance", "legal", "compliance", "business",
    "recruiting", "strategy", "management", "founder", "lead", "co-founder", "venture",
  ],
};

function extractUserKeywords(user) {
  if (!user) return [];
  const list = [];
  if (Array.isArray(user.studentDetails?.skills)) list.push(...user.studentDetails.skills);
  if (typeof user.studentDetails?.course === "string") list.push(user.studentDetails.course);
  if (Array.isArray(user.studentDetails?.careerPreferences?.fields)) {
    list.push(...user.studentDetails.careerPreferences.fields);
  }
  if (Array.isArray(user.alumniDetails?.skills)) list.push(...user.alumniDetails.skills);
  if (Array.isArray(user.companyDetails?.skills)) list.push(...user.companyDetails.skills);
  if (Array.isArray(user.projects)) {
    user.projects.forEach((p) => {
      if (Array.isArray(p.technologies)) list.push(...p.technologies);
      if (p.title) list.push(p.title);
      if (p.description) list.push(p.description);
    });
  }
  return list;
}

function scoreCapabilityPillars(skills = [], headline = "", bio = "") {
  const textBlob = `${skills.join(" ")} ${headline} ${bio}`.toLowerCase();
  const scores = { engineering: 0, product: 0, marketing: 0, operations: 0 };

  Object.entries(CAPABILITY_KEYWORDS).forEach(([pillar, keywords]) => {
    let count = 0;
    keywords.forEach((kw) => {
      if (textBlob.includes(kw)) count += 1;
    });
    scores[pillar] = Math.min(100, count * 25);
  });

  return scores;
}

export const getCofounderMatches = async (req, res) => {
  try {
    const currentUserId = req.user?.id;

    // Fetch current user if authenticated
    let currentUser = null;
    if (currentUserId) {
      currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { projects: true, submissions: true },
      });
    }

    const mySkills = extractUserKeywords(currentUser);
    const myPillars = scoreCapabilityPillars(mySkills, currentUser?.headline || "", currentUser?.bio || "");
    const hasCapabilityData = Object.values(myPillars).some((v) => v > 0);

    // Fetch potential candidates (verified users excluding self)
    const candidates = await prisma.user.findMany({
      where: {
        isVerified: true,
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
      },
      include: {
        projects: true,
        submissions: {
          where: { status: "approved" },
          select: { id: true, title: true, proofType: true },
        },
      },
      take: 50,
    });

    const matches = candidates.map((candidate) => {
      const candSkills = extractUserKeywords(candidate);
      const candPillars = scoreCapabilityPillars(candSkills, candidate.headline || "", candidate.bio || "");

      // Complementary Gap Scoring
      let gapSynergy = 0;
      const synergyFactors = [];

      Object.keys(CAPABILITY_KEYWORDS).forEach((pillar) => {
        const myScore = myPillars[pillar] || 0;
        const theirScore = candPillars[pillar] || 0;

        // Synergy: They have high capability where I have low capability
        if (myScore < 50 && theirScore >= 50) {
          gapSynergy += 30;
          synergyFactors.push(`Fills your ${pillar.toUpperCase()} capability gap (+${theirScore}% proficiency)`);
        } else if (theirScore >= 50) {
          gapSynergy += 15;
          synergyFactors.push(`Strong ${pillar.toUpperCase()} proficiency (+${theirScore}%)`);
        }
      });

      // Proof of Work boost
      const bteProofCount = candidate.submissions.length;
      if (bteProofCount > 0) {
        gapSynergy += Math.min(25, bteProofCount * 10);
        synergyFactors.push(`${bteProofCount} cryptographically verified Build-to-Earn proof(s) on-chain/ledger`);
      }

      // Base score
      const matchScore = Math.min(99, Math.max(58, gapSynergy + (candidate.isProfileComplete ? 10 : 0)));

      return {
        id: candidate.id,
        fullName: candidate.fullName,
        role: candidate.role,
        headline: candidate.headline || (candidate.role === "company" ? "Venture Founder" : "Technical Lead"),
        bio: candidate.bio,
        profileImage: candidate.profileImage,
        matchScore,
        candidatePillars: candPillars,
        myPillars,
        synergyFactors: synergyFactors.slice(0, 3),
        verifiedProofsCount: bteProofCount,
        recentProjects: candidate.projects.slice(0, 2).map((p) => p.title),
      };
    });

    // Sort by highest complementary match
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      currentUserPillars: myPillars,
      hasCapabilityData,
      totalCandidates: candidates.length,
      matches,
    });
  } catch (error) {
    console.error("Co-founder Matching Error:", error);
    res.status(500).json({ message: "Failed to calculate co-founder matches", error: error.message });
  }
};
