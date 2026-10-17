// wavesync_backend/controllers/networkController.js
import { prisma } from "../config/prisma.js";

// ==============================================================================
// 1. BASELINE ALUMNI & PEER DIRECTORY SEED HELPER (NON-DESTRUCTIVE)
// ==============================================================================
export const ensureDirectorySeeded = async () => {
  try {
    const defaultHash = "$2b$10$JeN16ThDvyw8RDPtXTOow.sqqF0YsmG0DtJpxVvk3u5AFG3LUEh8e"; // "password123"

    const seedAlumni = [
      {
        email: "ananya.iyer@alumni.iiitd.ac.in",
        fullName: "Dr. Ananya Iyer",
        role: "alumni",
        headline: "Staff ML Research Scientist @ DeepMind · Ex-IIITD",
        bio: "Mentoring students in reinforcement learning, verifiable neural execution, and graduate research pathways. Open for 1:1 mentorship and research collaboration.",
        institution: "IIIT Delhi",
        graduationYear: 2018,
        isAvailableForMentoring: true,
        willingToRefer: true,
        skills: ["PyTorch", "Python", "Reinforcement Learning", "LLM Alignment", "Research"],
        interests: ["AI Safety", "Algorithmic Game Theory", "Mentorship"],
        location: "London / Remote",
        isVerified: true,
        isProfileComplete: true,
        visibilityMode: "public",
        alumniDetails: {
          company: "Google DeepMind",
          role: "Staff Research Scientist",
          skills: ["PyTorch", "Python", "Reinforcement Learning", "LLM Alignment"],
          experienceYears: 6,
          isAvailableForMentoring: true,
        },
      },
      {
        email: "rohan.kulkarni@alumni.iitd.ac.in",
        fullName: "Rohan Kulkarni",
        role: "alumni",
        headline: "Principal Distributed Systems Architect @ Stripe",
        bio: "Building multi-region payment consensus systems in Rust and Go. Happy to review student backend codebases, conduct mock systems interviews, and refer high-craft engineers.",
        institution: "IIT Delhi",
        graduationYear: 2019,
        isAvailableForMentoring: true,
        willingToRefer: true,
        skills: ["Rust", "Go", "PostgreSQL", "Raft Consensus", "Distributed Systems", "Kubernetes"],
        interests: ["High-Throughput Systems", "Database Internals", "FinTech"],
        location: "San Francisco / Remote",
        isVerified: true,
        isProfileComplete: true,
        visibilityMode: "public",
        alumniDetails: {
          company: "Stripe",
          role: "Principal Systems Architect",
          skills: ["Rust", "Go", "PostgreSQL", "Raft Consensus"],
          experienceYears: 5,
          isAvailableForMentoring: true,
        },
      },
      {
        email: "vikram.sen@faculty.iiitd.ac.in",
        fullName: "Prof. Vikramaditya Sen",
        role: "admin",
        headline: "Director, Center for Distributed Protocols & Faculty Chair",
        bio: "Advising student venture roadmaps and academic capstones. Endorsing verified student teams for university ecosystem grants and incubator admissions.",
        institution: "IIIT Delhi",
        graduationYear: 2010,
        isAvailableForMentoring: true,
        willingToRefer: true,
        skills: ["Cryptography", "Systems Architecture", "Academic Research", "Grant Advisory"],
        interests: ["Zero-Knowledge Proofs", "Consensus Algorithms", "Student Ventures"],
        location: "Delhi, India",
        isVerified: true,
        isProfileComplete: true,
        visibilityMode: "public",
      },
      {
        email: "tanya.kapoor@linear.app",
        fullName: "Tanya Kapoor",
        role: "alumni",
        headline: "Head of Product Design @ Linear · BITS Pilani Alum",
        bio: "Obsessed with editorial interfaces, design systems, and tactile digital craftsmanship. Offering portfolio reviews and design architecture guidance for student builders.",
        institution: "BITS Pilani",
        graduationYear: 2020,
        isAvailableForMentoring: true,
        willingToRefer: true,
        skills: ["Figma", "Design Systems", "UI/UX", "Product Strategy", "TypeScript", "Tailwind CSS"],
        interests: ["Editorial Design", "Developer Tools", "Interaction Craft"],
        location: "Berlin / Remote",
        isVerified: true,
        isProfileComplete: true,
        visibilityMode: "public",
        alumniDetails: {
          company: "Linear",
          role: "Head of Product Design",
          skills: ["Figma", "Design Systems", "Product Strategy"],
          experienceYears: 4,
          isAvailableForMentoring: true,
        },
      },
      {
        email: "sid.mehta@venture.capital",
        role: "company",
        fullName: "Siddharth Mehta",
        headline: "Early-Stage Partner @ Nexus Seed · Tech Founder Alum",
        bio: "Backing technical student founders building deep devtools, AI agents, and cryptographic infrastructure. Actively reviewing student capstones for pre-seed syndication.",
        institution: "IIIT Delhi",
        graduationYear: 2017,
        isAvailableForMentoring: false,
        willingToRefer: true,
        skills: ["Venture Capital", "Fundraising", "GTM Strategy", "Recruiting"],
        interests: ["Pre-Seed Investing", "Open Source Monetization"],
        location: "Bengaluru, India",
        isVerified: true,
        isProfileComplete: true,
        visibilityMode: "public",
        companyDetails: {
          companyName: "Nexus Seed Partners",
          industry: "Venture Capital & Incubation",
          skills: ["Fundraising", "GTM Strategy", "Venture Scalability"],
        },
      },
    ];

    for (const u of seedAlumni) {
      const exists = await prisma.user.findUnique({ where: { email: u.email } });
      if (!exists) {
        await prisma.user.create({
          data: {
            ...u,
            password: defaultHash,
          },
        });
      }
    }
  } catch (err) {
    console.error("Directory Seed Notice:", err.message);
  }
};

// ==============================================================================
// 2. PEOPLE & ALUMNI DIRECTORY
// ==============================================================================

// @desc    Search and filter people (Students, Alumni, Faculty, Mentors, Founders)
// @route   GET /api/network/people
export const getPeopleDirectory = async (req, res) => {
  try {
    await ensureDirectorySeeded();

    const currentUserId = req.user?.id;
    const {
      role,
      search,
      institution,
      graduationYear,
      skill,
      mentorship,
      referral,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * take;

    const where = {};

    // Exclude private accounts if not logged in
    if (!currentUserId) {
      where.visibilityMode = "public";
    }

    // Role filter
    if (role && role !== "all") {
      where.role = role;
    }

    // Institution filter
    if (institution) {
      where.institution = { contains: String(institution), mode: "insensitive" };
    }

    // Graduation Year filter
    if (graduationYear) {
      where.graduationYear = parseInt(graduationYear, 10);
    }

    // Mentorship availability filter
    if (mentorship === "true") {
      where.isAvailableForMentoring = true;
    }

    // Referral availability filter
    if (referral === "true") {
      where.willingToRefer = true;
    }

    // Skill filter
    if (skill) {
      where.skills = { has: String(skill) };
    }

    // Search query across fullName, headline, bio, and skills
    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { headline: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        { institution: { contains: q, mode: "insensitive" } },
        { skills: { has: q } },
      ];
    }

    const [total, people] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          headline: true,
          bio: true,
          profileImage: true,
          institution: true,
          graduationYear: true,
          isAvailableForMentoring: true,
          willingToRefer: true,
          skills: true,
          interests: true,
          location: true,
          isVerified: true,
          isProfileComplete: true,
          studentDetails: true,
          alumniDetails: true,
          companyDetails: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              submissions: true,
              collabPosts: true,
            },
          },
        },
        orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
    ]);

    // If current user is logged in, attach connection status with each person
    let userConnections = [];
    if (currentUserId) {
      userConnections = await prisma.connection.findMany({
        where: {
          OR: [{ requesterId: currentUserId }, { recipientId: currentUserId }],
        },
      });
    }

    const connectionMap = new Map();
    userConnections.forEach((c) => {
      if (c.requesterId === currentUserId) {
        connectionMap.set(c.recipientId, { status: c.status, type: "outgoing", id: c.id });
      } else {
        connectionMap.set(c.requesterId, { status: c.status, type: "incoming", id: c.id });
      }
    });

    const formatted = people.map((p) => {
      const conn = connectionMap.get(p.id);
      let connectionStatus = "none";
      let connectionId = null;

      if (conn) {
        connectionId = conn.id;
        if (conn.status === "accepted") {
          connectionStatus = "connected";
        } else if (conn.status === "pending") {
          connectionStatus = conn.type === "outgoing" ? "pending_sent" : "pending_received";
        } else {
          connectionStatus = "declined";
        }
      }

      return {
        ...p,
        connectionStatus,
        connectionId,
        isSelf: p.id === currentUserId,
      };
    });

    res.json({
      success: true,
      people: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / take),
      hasMore: skip + people.length < total,
    });
  } catch (error) {
    console.error("Directory Search Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve directory", error: error.message });
  }
};

// @desc    Get detailed public profile of a person
// @route   GET /api/network/people/:id
export const getPersonProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const person = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        role: true,
        headline: true,
        bio: true,
        profileImage: true,
        institution: true,
        graduationYear: true,
        isAvailableForMentoring: true,
        willingToRefer: true,
        skills: true,
        interests: true,
        location: true,
        isVerified: true,
        studentDetails: true,
        alumniDetails: true,
        companyDetails: true,
        createdAt: true,
        projects: {
          select: { id: true, title: true, description: true, technologies: true, github: true, live: true },
          take: 5,
        },
        submissions: {
          where: { status: "approved" },
          select: { id: true, title: true, proofType: true, proofUrl: true, createdAt: true },
          take: 5,
        },
        collabPosts: {
          where: { isActive: true },
          select: { id: true, title: true, type: true, roles: true, createdAt: true },
          take: 5,
        },
      },
    });

    if (!person) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    // Determine connection state
    let connectionStatus = "none";
    let connectionId = null;

    if (currentUserId && currentUserId !== id) {
      const conn = await prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId: currentUserId, recipientId: id },
            { requesterId: id, recipientId: currentUserId },
          ],
        },
      });

      if (conn) {
        connectionId = conn.id;
        if (conn.status === "accepted") {
          connectionStatus = "connected";
        } else if (conn.status === "pending") {
          connectionStatus = conn.requesterId === currentUserId ? "pending_sent" : "pending_received";
        } else {
          connectionStatus = "declined";
        }
      }
    }

    res.json({
      success: true,
      person: {
        ...person,
        connectionStatus,
        connectionId,
        isSelf: currentUserId === id,
      },
    });
  } catch (error) {
    console.error("Person Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile", error: error.message });
  }
};

// @desc    Update current authenticated user's permitted profile fields
// @route   PATCH /api/network/profile
export const updateNetworkProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      headline,
      bio,
      institution,
      graduationYear,
      isAvailableForMentoring,
      willingToRefer,
      skills,
      interests,
      location,
      visibilityMode,
    } = req.body;

    const data = {};
    if (headline !== undefined) data.headline = String(headline).slice(0, 160);
    if (bio !== undefined) data.bio = String(bio).slice(0, 800);
    if (institution !== undefined) data.institution = String(institution).slice(0, 100);
    if (graduationYear !== undefined) {
      const yr = parseInt(graduationYear, 10);
      data.graduationYear = isNaN(yr) ? null : yr;
    }
    if (isAvailableForMentoring !== undefined) data.isAvailableForMentoring = Boolean(isAvailableForMentoring);
    if (willingToRefer !== undefined) data.willingToRefer = Boolean(willingToRefer);
    if (Array.isArray(skills)) data.skills = skills.map(String).slice(0, 20);
    if (Array.isArray(interests)) data.interests = interests.map(String).slice(0, 20);
    if (location !== undefined) data.location = String(location).slice(0, 100);
    if (visibilityMode && ["public", "private"].includes(visibilityMode)) data.visibilityMode = visibilityMode;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        headline: true,
        bio: true,
        institution: true,
        graduationYear: true,
        isAvailableForMentoring: true,
        willingToRefer: true,
        skills: true,
        interests: true,
        location: true,
        visibilityMode: true,
        isProfileComplete: true,
      },
    });

    res.json({ success: true, message: "Profile updated successfully.", user: updated });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
};

// ==============================================================================
// 3. REAL CONNECTION REQUESTS & LIFECYCLE
// ==============================================================================

// @desc    Send a connection request
// @route   POST /api/network/connections
export const sendConnectionRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { recipientId, message } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: "Recipient ID is required." });
    }

    if (requesterId === recipientId) {
      return res.status(400).json({ success: false, message: "You cannot connect with yourself." });
    }

    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient user not found." });
    }

    // Check if relation already exists in either direction
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, recipientId },
          { requesterId: recipientId, recipientId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(409).json({ success: false, message: "You are already connected with this user." });
      }
      if (existing.status === "pending") {
        return res.status(409).json({ success: false, message: "A connection request is already pending between you." });
      }
      // If declined, update status back to pending with new message
      const renewed = await prisma.connection.update({
        where: { id: existing.id },
        data: {
          requesterId,
          recipientId,
          status: "pending",
          message: message ? String(message).slice(0, 300) : null,
        },
      });
      return res.status(200).json({ success: true, message: "Connection request resent.", connection: renewed });
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId,
        recipientId,
        status: "pending",
        message: message ? String(message).slice(0, 300) : null,
      },
    });

    res.status(201).json({ success: true, message: "Connection request sent.", connection });
  } catch (error) {
    console.error("Connection Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to send connection request", error: error.message });
  }
};

// @desc    Get accepted connections
// @route   GET /api/network/connections
export const getAcceptedConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await prisma.connection.findMany({
      where: {
        status: "accepted",
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
      include: {
        requester: {
          select: { id: true, fullName: true, role: true, headline: true, profileImage: true, institution: true },
        },
        recipient: {
          select: { id: true, fullName: true, role: true, headline: true, profileImage: true, institution: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = connections.map((c) => {
      const partner = c.requesterId === userId ? c.recipient : c.requester;
      return {
        connectionId: c.id,
        connectedAt: c.updatedAt,
        partner,
        otherUser: partner,
      };
    });

    res.json({ success: true, connections: formatted });
  } catch (error) {
    console.error("Connections Fetch Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve connections", error: error.message });
  }
};

// @desc    Get incoming and outgoing pending connection requests
// @route   GET /api/network/connections/requests
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [incoming, outgoing] = await Promise.all([
      prisma.connection.findMany({
        where: { recipientId: userId, status: "pending" },
        include: {
          requester: {
            select: { id: true, fullName: true, role: true, headline: true, profileImage: true, institution: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.connection.findMany({
        where: { requesterId: userId, status: "pending" },
        include: {
          recipient: {
            select: { id: true, fullName: true, role: true, headline: true, profileImage: true, institution: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({ success: true, incoming, outgoing });
  } catch (error) {
    console.error("Requests Fetch Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve requests", error: error.message });
  }
};

// @desc    Accept or decline a connection request
// @route   PATCH /api/network/connections/:id
export const respondToConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const status = req.body.status || (req.body.action === 'accept' ? 'accepted' : req.body.action === 'decline' ? 'declined' : null);

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'declined'." });
    }

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection request not found." });
    }

    // Strict Authorization: ONLY the recipient may accept or decline
    if (connection.recipientId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized. Only the recipient can accept or decline this request." });
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status },
    });

    // When connection is accepted, initialize or retrieve a Conversation so peers can message
    if (status === "accepted") {
      const u1 = connection.requesterId < connection.recipientId ? connection.requesterId : connection.recipientId;
      const u2 = connection.requesterId < connection.recipientId ? connection.recipientId : connection.requesterId;

      await prisma.conversation.upsert({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        update: { lastMessageAt: new Date() },
        create: {
          user1Id: u1,
          user2Id: u2,
          lastMessageAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: `Connection request ${status}.`,
      connection: updated,
    });
  } catch (error) {
    console.error("Connection Response Error:", error);
    res.status(500).json({ success: false, message: "Failed to respond to request", error: error.message });
  }
};

// ==============================================================================
// 4. INTENT-BASED MENTORSHIP REQUESTS
// ==============================================================================

// @desc    Send an intent-based mentorship request
// @route   POST /api/network/mentorship-requests
export const sendMentorshipRequest = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { mentorId, topic, message, notes } = req.body;

    if (!mentorId) {
      return res.status(400).json({ success: false, message: "Mentor ID is required." });
    }

    const finalMessage = message ? String(message).slice(0, 600) : (notes ? String(notes).slice(0, 600) : "Interested in mentorship connection.");

    if (studentId === mentorId) {
      return res.status(400).json({ success: false, message: "You cannot request mentorship from yourself." });
    }

    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found." });
    }

    if (!mentor.isAvailableForMentoring && mentor.role !== "alumni" && mentor.role !== "admin") {
      return res.status(400).json({ success: false, message: "This user is currently not accepting mentorship requests." });
    }

    const existing = await prisma.mentorship.findUnique({
      where: { studentId_alumniId: { studentId, alumniId: mentorId } },
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(409).json({ success: false, message: "You already have an active mentorship with this mentor." });
      }
      if (existing.status === "pending") {
        return res.status(409).json({ success: false, message: "A mentorship request is already pending with this mentor." });
      }

      const renewed = await prisma.mentorship.update({
        where: { id: existing.id },
        data: {
          topic: topic ? String(topic).slice(0, 100) : "Career & Technical Mentorship",
          message: finalMessage,
          status: "pending",
        },
      });
      return res.json({ success: true, message: "Mentorship request renewed.", request: renewed, mentorship: renewed });
    }

    const mentorship = await prisma.mentorship.create({
      data: {
        studentId,
        alumniId: mentorId,
        topic: topic ? String(topic).slice(0, 100) : "Career & Technical Mentorship",
        message: finalMessage,
        status: "pending",
      },
    });

    res.status(201).json({ success: true, message: "Mentorship request submitted.", request: mentorship, mentorship });
  } catch (error) {
    console.error("Mentorship Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to send mentorship request", error: error.message });
  }
};

// @desc    Get current user's sent and received mentorship requests
// @route   GET /api/network/mentorship-requests
export const getMyMentorshipRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [sent, received] = await Promise.all([
      prisma.mentorship.findMany({
        where: { studentId: userId },
        include: {
          alumni: {
            select: { id: true, fullName: true, headline: true, profileImage: true, institution: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.mentorship.findMany({
        where: { alumniId: userId },
        include: {
          student: {
            select: { id: true, fullName: true, headline: true, profileImage: true, institution: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({ success: true, sent, received });
  } catch (error) {
    console.error("Mentorship Fetch Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve mentorship requests", error: error.message });
  }
};

// @desc    Respond to a mentorship request (Accept/Reject + Notes)
// @route   PATCH /api/network/mentorship-requests/:id
export const respondToMentorshipRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, outcomeNotes } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'." });
    }

    const mentorship = await prisma.mentorship.findUnique({ where: { id } });
    if (!mentorship) {
      return res.status(404).json({ success: false, message: "Mentorship request not found." });
    }

    // Only the mentor (alumniId) can accept or reject
    if (mentorship.alumniId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized. Only the requested mentor can respond." });
    }

    const updated = await prisma.mentorship.update({
      where: { id },
      data: {
        status,
        outcomeNotes: outcomeNotes ? String(outcomeNotes).slice(0, 500) : mentorship.outcomeNotes,
      },
    });

    // Also establish conversation if accepted
    if (status === "accepted") {
      const u1 = mentorship.studentId < mentorship.alumniId ? mentorship.studentId : mentorship.alumniId;
      const u2 = mentorship.studentId < mentorship.alumniId ? mentorship.alumniId : mentorship.studentId;

      await prisma.conversation.upsert({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        update: { lastMessageAt: new Date() },
        create: {
          user1Id: u1,
          user2Id: u2,
          lastMessageAt: new Date(),
        },
      });
    }

    res.json({ success: true, message: `Mentorship request ${status}.`, mentorship: updated });
  } catch (error) {
    console.error("Mentorship Response Error:", error);
    res.status(500).json({ success: false, message: "Failed to respond to mentorship request", error: error.message });
  }
};

// ==============================================================================
// 5. DIRECT MESSAGING BETWEEN CONNECTED PEERS
// ==============================================================================

// @desc    Get user's conversations
// @route   GET /api/network/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, fullName: true, role: true, headline: true, profileImage: true } },
        user2: { select: { id: true, fullName: true, role: true, headline: true, profileImage: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const formatted = conversations.map((conv) => {
      const partner = conv.user1Id === userId ? conv.user2 : conv.user1;
      const lastMsg = conv.messages[0] || null;

      return {
        id: conv.id,
        partner,
        lastMessageAt: conv.lastMessageAt,
        lastMessage: lastMsg ? { content: lastMsg.content, createdAt: lastMsg.createdAt, senderId: lastMsg.senderId } : null,
      };
    });

    res.json({ success: true, conversations: formatted });
  } catch (error) {
    console.error("Conversations Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve conversations", error: error.message });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/network/conversations/:id/messages
export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        user1: { select: { id: true, fullName: true, profileImage: true } },
        user2: { select: { id: true, fullName: true, profileImage: true } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    // Security: Only participants can read messages
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized. You are not a participant in this conversation." });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Mark partner's unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const partner = conversation.user1Id === userId ? conversation.user2 : conversation.user1;

    res.json({
      success: true,
      partner,
      messages,
    });
  } catch (error) {
    console.error("Messages Fetch Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages", error: error.message });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/network/conversations/:id/messages
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Message content cannot be empty." });
    }

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    // Security: Only participants can post messages
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized. You are not a participant in this conversation." });
    }

    const sanitized = content.trim().slice(0, 2000);

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        content: sanitized,
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
  }
};

// ==============================================================================
// 6. EXPLAINABLE PEOPLE & ALUMNI RECOMMENDATIONS
// ==============================================================================

// @desc    Get explainable mentor and peer recommendations
// @route   GET /api/network/recommendations
export const getExplainableRecommendations = async (req, res) => {
  try {
    await ensureDirectorySeeded();

    const currentUserId = req.user?.id;
    let currentUser = null;

    if (currentUserId) {
      currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { projects: true },
      });
    }

    // Candidate candidates (exclude current user)
    const candidates = await prisma.user.findMany({
      where: {
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
        isVerified: true,
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        headline: true,
        bio: true,
        profileImage: true,
        institution: true,
        graduationYear: true,
        isAvailableForMentoring: true,
        willingToRefer: true,
        skills: true,
        interests: true,
        studentDetails: true,
        alumniDetails: true,
        companyDetails: true,
        _count: { select: { submissions: true } },
      },
      take: 30,
    });

    // Extract user tokens
    const userTokens = new Set();
    if (currentUser) {
      if (Array.isArray(currentUser.skills)) currentUser.skills.forEach((s) => userTokens.add(s.toLowerCase()));
      if (Array.isArray(currentUser.studentDetails?.skills)) {
        currentUser.studentDetails.skills.forEach((s) => userTokens.add(s.toLowerCase()));
      }
      if (Array.isArray(currentUser.studentDetails?.careerPreferences?.fields)) {
        currentUser.studentDetails.careerPreferences.fields.forEach((f) => userTokens.add(f.toLowerCase()));
      }
      if (typeof currentUser.studentDetails?.course === "string") {
        userTokens.add(currentUser.studentDetails.course.toLowerCase());
      }
    }

    const scored = candidates.map((cand) => {
      let score = 50;
      const reasons = [];

      // Check shared institution
      if (currentUser?.institution && cand.institution && currentUser.institution.toLowerCase() === cand.institution.toLowerCase()) {
        score += 20;
        reasons.push(`Shared alumni alma mater: ${cand.institution}`);
      }

      // Check mentorship availability
      if (cand.isAvailableForMentoring && (cand.role === "alumni" || cand.role === "admin")) {
        score += 15;
        reasons.push("Actively accepting 1:1 student mentorship requests");
      }

      // Check skill overlap or complementarity
      const candSkills = [
        ...(cand.skills || []),
        ...(cand.alumniDetails?.skills || []),
        ...(cand.companyDetails?.skills || []),
      ].map((s) => s.toLowerCase());

      const commonSkills = candSkills.filter((s) => userTokens.has(s));
      if (commonSkills.length > 0) {
        score += Math.min(25, commonSkills.length * 10);
        reasons.push(`Expertise overlap in ${commonSkills.slice(0, 3).join(", ")}`);
      } else if (candSkills.length > 0) {
        reasons.push(`Offers complementary knowledge in ${candSkills.slice(0, 2).join(", ")}`);
      }

      if (reasons.length === 0) {
        reasons.push("Verified builder in the WaveSync institutional ecosystem");
      }

      const scoreVal = Math.min(99, score);
      return {
        ...cand,
        score: scoreVal,
        matchScore: scoreVal,
        reasons,
        explanation: reasons.join(". ") + ".",
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      hasProfileData: userTokens.size > 0,
      recommendations: scored.slice(0, 8),
    });
  } catch (error) {
    console.error("Recommendations Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate recommendations", error: error.message });
  }
};

// ==============================================================================
// 7. OUTCOME TRACKING & RECORDING
// ==============================================================================

// @desc    Record a tangible networking or mentorship outcome
// @route   POST /api/network/outcomes
export const recordNetworkOutcome = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = req.body.partnerId || req.body.otherUserId;
    const type = req.body.type || req.body.outcomeType;
    const title = req.body.title;
    const description = req.body.description || req.body.details || req.body.metrics;
    const conversationId = req.body.conversationId;

    const validTypes = [
      "mentorship_completed",
      "referral_received",
      "job_offer",
      "collab_started",
      "project_shipped",
      "startup_intro",
    ];

    if (!partnerId || !title || !type) {
      return res.status(400).json({ success: false, message: "Partner ID, title, and outcome type are required." });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(", ")}` });
    }

    const partner = await prisma.user.findUnique({ where: { id: partnerId } });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner user not found." });
    }

    const outcome = await prisma.networkOutcome.create({
      data: {
        userId,
        partnerId,
        type,
        title: String(title).slice(0, 140),
        description: description ? String(description).slice(0, 600) : null,
        conversationId: conversationId || null,
        status: "verified",
      },
    });

    const formattedOutcome = {
      ...outcome,
      outcomeType: outcome.type,
    };

    res.status(201).json({ success: true, message: "Networking outcome recorded.", outcome: formattedOutcome });
  } catch (error) {
    console.error("Outcome Record Error:", error);
    res.status(500).json({ success: false, message: "Failed to record outcome", error: error.message });
  }
};

// @desc    Get user outcomes and ecosystem impact summaries
// @route   GET /api/network/outcomes
export const getNetworkOutcomes = async (req, res) => {
  try {
    const userId = req.user.id;

    const [userOutcomes, totalOutcomesCount] = await Promise.all([
      prisma.networkOutcome.findMany({
        where: {
          OR: [{ userId }, { partnerId: userId }],
        },
        include: {
          user: { select: { id: true, fullName: true, role: true } },
          partner: { select: { id: true, fullName: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.networkOutcome.count(),
    ]);

    const formatted = userOutcomes.map((o) => ({
      ...o,
      outcomeType: o.type,
    }));

    res.json({
      success: true,
      userOutcomes: formatted,
      outcomes: formatted,
      totalEcosystemOutcomes: totalOutcomesCount,
    });
  } catch (error) {
    console.error("Outcomes Fetch Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch outcomes", error: error.message });
  }
};
