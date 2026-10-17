// wavesync_backend/controllers/graphController.js
import { prisma } from "../config/prisma.js";

// @desc    Get live 3D / 2D Opportunity Graph data
export const getOpportunityGraph = async (req, res) => {
  try {
    const [users, jobs, collabs, submissions] = await Promise.all([
      prisma.user.findMany({
        where: { isVerified: true },
        select: {
          id: true,
          fullName: true,
          role: true,
          headline: true,
          studentDetails: true,
          companyDetails: true,
          alumniDetails: true,
          profileImage: true,
        },
        take: 30,
      }),
      prisma.job.findMany({
        where: { status: "open" },
        include: {
          postedBy: { select: { id: true, fullName: true } },
        },
        take: 20,
      }),
      prisma.collabPost.findMany({
        where: { isActive: true },
        include: {
          author: { select: { id: true, fullName: true } },
          applicants: { select: { studentId: true } },
        },
        take: 20,
      }),
      prisma.submission.findMany({
        where: { status: "approved" },
        include: {
          author: { select: { id: true, fullName: true } },
          reviews: { select: { reviewerId: true, verdict: true } },
        },
        take: 20,
      }),
    ]);

    // Build Graph Nodes
    const nodes = [];
    const edges = [];
    const addedNodeIds = new Set();

    // 1. Ecosystem Grant Nodes (verifiable platform initiatives)
    const grantNodes = [
      {
        id: "grant-mesh-25k",
        label: "$25,000 Ecosystem Grant",
        sub: "WaveSync Foundation",
        type: "grant",
        color: "#9D7AFF",
        size: 0.38,
        details: {
          tag: "Open Grant",
          description: "Non-dilutive milestone grant for verifiable distributed systems and developer infrastructure.",
          metric: "Active Pool · Apply via Project",
          grantAmount: "$25,000",
        },
      },
      {
        id: "grant-ai-eval-10k",
        label: "$10,000 AI Research Grant",
        sub: "Alignment Cohort",
        type: "grant",
        color: "#9D7AFF",
        size: 0.34,
        details: {
          tag: "Ecosystem Grant",
          description: "Bounty for deterministic benchmark validation and verifiable neural execution paths.",
          metric: "3 Milestones Remaining",
          grantAmount: "$10,000",
        },
      },
    ];

    grantNodes.forEach((g) => {
      nodes.push(g);
      addedNodeIds.add(g.id);
    });

    // 2. User Nodes (Founders, Collaborators, Mentors)
    users.forEach((u) => {
      const isFounder = u.role === "company";
      const isMentor = u.role === "alumni";
      const type = isFounder ? "founder" : isMentor ? "mentor" : "builder";
      const color = isFounder ? "#FF4B2F" : isMentor ? "#FFAA00" : "#C9FF4F";

      nodes.push({
        id: `user-${u.id}`,
        rawId: u.id,
        label: u.fullName,
        sub: u.headline || (isFounder ? "Venture Founder" : isMentor ? "Technical Mentor" : "Verified Builder"),
        type,
        color,
        size: isFounder ? 0.35 : 0.3,
        details: {
          tag: isFounder ? "Venture Founder" : isMentor ? "Alumni Mentor" : "Verified Collaborator",
          description: u.headline || `${u.fullName} is an active participant in the WaveSync network.`,
          metric: isFounder ? "Hiring & Backing" : "Peer Verified",
        },
      });
      addedNodeIds.add(`user-${u.id}`);
    });

    // 3. Project Nodes (CollabPosts)
    collabs.forEach((c) => {
      const nodeId = `collab-${c.id}`;
      nodes.push({
        id: nodeId,
        rawId: c.id,
        label: c.title,
        sub: `${c.type} · ${c.roles.slice(0, 2).join(", ")}`,
        type: "project",
        color: "#00D7B9",
        size: 0.4,
        details: {
          tag: "Active Project",
          description: c.description,
          metric: `${c.applicants.length} Applicants Joined`,
        },
      });
      addedNodeIds.add(nodeId);

      // Edge from Author to Project
      if (addedNodeIds.has(`user-${c.authorId}`)) {
        edges.push({
          source: `user-${c.authorId}`,
          target: nodeId,
          relationship: "authored",
          color: "#00D7B9",
        });
      }

      // Link first project to grant for ecosystem pathway demonstration
      if (grantNodes.length > 0) {
        edges.push({
          source: nodeId,
          target: grantNodes[0].id,
          relationship: "eligible_for",
          color: "#9D7AFF",
        });
      }
    });

    // 4. Job Nodes
    jobs.forEach((j) => {
      const nodeId = `job-${j.id}`;
      nodes.push({
        id: nodeId,
        rawId: j.id,
        label: j.title,
        sub: `${j.companyName} · ${j.jobType}`,
        type: "job",
        color: "#3B82F6",
        size: 0.32,
        details: {
          tag: "Opportunity",
          description: j.description,
          metric: j.salaryRange || "Competitive Equity",
        },
      });
      addedNodeIds.add(nodeId);

      if (addedNodeIds.has(`user-${j.postedById}`)) {
        edges.push({
          source: `user-${j.postedById}`,
          target: nodeId,
          relationship: "hiring",
          color: "#3B82F6",
        });
      }
    });

    // 5. Build-to-Earn Submissions
    submissions.forEach((s) => {
      const nodeId = `sub-${s.id}`;
      nodes.push({
        id: nodeId,
        rawId: s.id,
        label: s.title,
        sub: `Proof (${s.proofType}) · Signed`,
        type: "submission",
        color: "#C9FF4F",
        size: 0.34,
        details: {
          tag: "Verified Proof",
          description: s.description,
          metric: "Ed25519 Signed",
          proofUrl: s.proofUrl,
        },
      });
      addedNodeIds.add(nodeId);

      if (addedNodeIds.has(`user-${s.authorId}`)) {
        edges.push({
          source: `user-${s.authorId}`,
          target: nodeId,
          relationship: "submitted_proof",
          color: "#C9FF4F",
        });
      }

      // Link to collab if connected
      if (s.collabPostId && addedNodeIds.has(`collab-${s.collabPostId}`)) {
        edges.push({
          source: nodeId,
          target: `collab-${s.collabPostId}`,
          relationship: "contributed_to",
          color: "#00D7B9",
        });
      }
    });

    // Compute deterministic 3D positions in a spherical layout
    const total = nodes.length;
    nodes.forEach((node, i) => {
      const phi = Math.acos(-1 + (2 * i) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;
      const radius = 2.4 + (i % 3) * 0.4;
      node.pos = [
        Number((radius * Math.cos(theta) * Math.sin(phi)).toFixed(2)),
        Number((radius * Math.sin(theta) * Math.sin(phi)).toFixed(2)),
        Number((radius * Math.cos(phi)).toFixed(2)),
      ];
    });

    res.json({
      success: true,
      nodes,
      edges,
      links: edges,
      stats: {
        totalEntities: nodes.length,
        totalNodes: nodes.length,
        users: users.length,
        jobs: jobs.length,
        projects: collabs.length,
        verifiedProofs: submissions.length,
      },
    });
  } catch (error) {
    console.error("Graph Error:", error);
    res.status(500).json({ message: "Failed to generate graph data", error: error.message });
  }
};
