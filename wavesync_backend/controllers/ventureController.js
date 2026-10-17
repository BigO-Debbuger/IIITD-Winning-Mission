// wavesync_backend/controllers/ventureController.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const KNOWN_ECOSYSTEM_GRANTS = [
  {
    grantName: "Ethereum Foundation Ecosystem Support Program",
    amount: "Up to $30,000",
    focus: "Open Source Tooling, Cryptography & Verifiable Protocols",
    criteria: "Public open-source repository with reproducible test suites and architecture specs",
    source: "https://esp.ethereum.foundation",
  },
  {
    grantName: "Protocol Labs DevGrants",
    amount: "Up to $20,000",
    focus: "Verifiable Compute, Distributed State & Peer-to-Peer Networks",
    criteria: "Working proof-of-concept milestone delivered on GitHub",
    source: "https://github.com/protocol/devgrants",
  },
  {
    grantName: "Gitcoin Open Source Community Grants",
    amount: "$5,000 - $15,000",
    focus: "Developer Infrastructure, Public Goods & Web Tooling",
    criteria: "Active collaborative initiative with verified public deliverables",
    source: "https://explorer.gitcoin.co",
  },
];

function generateDeterministicVenturePlan(idea = "", targetDomain = "Developer Tools") {
  const cleanIdea = idea.trim();
  const title = cleanIdea.length > 50 ? `${cleanIdea.slice(0, 48)}...` : cleanIdea || "Autonomous Protocol Engine";

  return {
    planTitle: `Venture Blueprint: ${title}`,
    problemStatement: `High coordination latency and unverified proof claims currently prevent teams from scaling "${cleanIdea || 'the core venture'}" with high conviction.`,
    targetUsers: [
      "Early-stage technical co-founders seeking verified collaborators",
      "Ecosystem grant committees evaluating technical milestone completion",
      "Specialized engineers looking for high-equity founding opportunities",
    ],
    coreAssumptions: [
      "Founders prefer peer-reviewed proof artifacts over unverified resumes.",
      "Non-dilutive milestone bounties significantly accelerate initial MVP delivery.",
      "Deterministic capability gap analysis shortens co-founder search times by >60%.",
    ],
    validationExperiments: [
      {
        hypothesis: "At least 15 senior builders will submit proofs for a $2.5k milestone bounty.",
        method: "Launch a structured Build-to-Earn task with clear GitHub acceptance tests.",
        metric: "15+ PR submissions within 7 business days.",
      },
      {
        hypothesis: "Potential co-founders will initiate contact if complementary fit exceeds 80%.",
        method: "Publish venture gap profile with highlighted engineering vs product requirements.",
        metric: "5+ high-conviction candidate introductory calls scheduled.",
      },
    ],
    mvpScope: {
      mustHave: [
        "Interactive proof validation pipeline",
        "Deterministic co-founder compatibility score",
        "Ed25519 cryptographic review signature verification",
      ],
      outOfScopeForAlpha: [
        "Multi-token governance mechanics",
        "Automated cross-border fiat payroll escrow",
      ],
    },
    technicalMilestones: [
      {
        phase: "Milestone 1 — Core Architecture",
        duration: "2-3 Weeks",
        deliverable: "Schema definitions, relational integrity tests, and proof verification endpoints.",
      },
      {
        phase: "Milestone 2 — Interactive Interface",
        duration: "3-4 Weeks",
        deliverable: "Tactile web portal, 3D opportunity visualizer, and candidate collaboration board.",
      },
      {
        phase: "Milestone 3 — Pilot Cohort Launch",
        duration: "2 Weeks",
        deliverable: "First 10 verified venture teams formed and funded via milestone grant allocations.",
      },
    ],
    requiredTeamCapabilities: [
      {
        discipline: "Technical / Systems Architect",
        skills: ["Rust or Go", "PostgreSQL", "Distributed Systems", "Cryptographic Signatures"],
        priority: "High",
      },
      {
        discipline: "Product & Spatial UI Craft",
        skills: ["React", "TypeScript", "Three.js / WebGL", "Tactile Design Systems"],
        priority: "High",
      },
      {
        discipline: "Growth & Ecosystem DevRel",
        skills: ["Developer Outreach", "Hackathon Community", "Grant Writing"],
        priority: "Medium",
      },
    ],
    candidateBounties: [
      {
        task: "Implement sub-second cryptographic payload verification",
        reward: "$1,500 Bounty",
        proofType: "github",
      },
      {
        task: "Design and implement tactile interactive capability canvas",
        reward: "$1,200 Bounty",
        proofType: "live",
      },
    ],
    matchedGrants: KNOWN_ECOSYSTEM_GRANTS,
    generationMode: "deterministic-heuristic",
  };
}

export const generateVenturePlan = async (req, res) => {
  try {
    const { idea, targetDomain, stage } = req.body;

    if (!idea || typeof idea !== "string" || idea.trim().length < 10) {
      return res.status(400).json({ message: "Please provide a detailed startup idea description (at least 10 characters)." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful deterministic fallback
      const plan = generateDeterministicVenturePlan(idea, targetDomain);
      return res.json({ success: true, plan });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are the WaveSync AI Venture Architect. Analyze this startup idea and generate a structured, JSON-only venture development plan.
Idea: "${idea}"
Target Domain: "${targetDomain || 'Developer Infrastructure'}"
Stage: "${stage || 'Pre-Seed Idea'}"

Return ONLY valid JSON matching this schema:
{
  "planTitle": "string",
  "problemStatement": "string",
  "targetUsers": ["string", "string"],
  "coreAssumptions": ["string", "string"],
  "validationExperiments": [{"hypothesis": "string", "method": "string", "metric": "string"}],
  "mvpScope": {"mustHave": ["string"], "outOfScopeForAlpha": ["string"]},
  "technicalMilestones": [{"phase": "string", "duration": "string", "deliverable": "string"}],
  "requiredTeamCapabilities": [{"discipline": "string", "skills": ["string"], "priority": "High" | "Medium"}],
  "candidateBounties": [{"task": "string", "reward": "string", "proofType": "github" | "live"}]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      res.json({
        success: true,
        plan: {
          ...parsed,
          matchedGrants: KNOWN_ECOSYSTEM_GRANTS,
          generationMode: "gemini-ai",
        },
      });
    } catch (aiErr) {
      console.warn("⚠️ [AI FALLBACK] Gemini error, using deterministic plan:", aiErr.message);
      const plan = generateDeterministicVenturePlan(idea, targetDomain);
      return res.json({ success: true, plan });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to generate venture blueprint", error: error.message });
  }
};

export const getEcosystemGrants = (req, res) => {
  res.json(KNOWN_ECOSYSTEM_GRANTS);
};
