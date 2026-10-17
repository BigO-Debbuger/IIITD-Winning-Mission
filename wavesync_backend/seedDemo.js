// wavesync_backend/seedDemo.js
// Non-destructive demo seeding script for live demonstration.
// Establishes consistent, clearly labeled demo accounts for Student, Alumni Reviewer, and Founder roles.
// Usage: node seedDemo.js

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export async function seedDemoData() {
  console.log("🌱 Establishing demo dataset for live presentation...");

  const defaultPassword = await bcrypt.hash("Password@123", 10);

  // 1. Demo Student / Builder
  const student = await prisma.user.upsert({
    where: { email: "student.demo@wavesync.io" },
    update: {
      password: defaultPassword,
      isVerified: true,
      isProfileComplete: true,
      headline: "[Demo Builder] Systems Engineer & Protocol Developer",
      bio: "Undergraduate systems builder exploring deterministic consensus, WebAssembly runtimes, and verifiable computation proofs.",
      skills: ["Rust", "TypeScript", "Distributed Systems", "WebAssembly", "PostgreSQL"],
      institution: "IIIT Delhi",
      graduationYear: 2026,
    },
    create: {
      email: "student.demo@wavesync.io",
      password: defaultPassword,
      role: "student",
      fullName: "Alex Chen (Demo Builder)",
      isVerified: true,
      isProfileComplete: true,
      headline: "[Demo Builder] Systems Engineer & Protocol Developer",
      bio: "Undergraduate systems builder exploring deterministic consensus, WebAssembly runtimes, and verifiable computation proofs.",
      skills: ["Rust", "TypeScript", "Distributed Systems", "WebAssembly", "PostgreSQL"],
      institution: "IIIT Delhi",
      graduationYear: 2026,
      studentDetails: {
        university: "IIIT Delhi",
        course: "B.Tech Computer Science",
        semester: "6th",
        skills: ["Rust", "TypeScript", "Distributed Systems", "WebAssembly", "PostgreSQL"],
        careerPreferences: {
          fields: ["Systems Engineering", "Distributed Infrastructure"],
          jobTypes: ["Founding Engineer", "Summer Internship"],
          timeline: ["Immediate"],
        },
      },
    },
  });

  // 2. Demo Alumni Reviewer
  const alumni = await prisma.user.upsert({
    where: { email: "alumni.demo@wavesync.io" },
    update: {
      password: defaultPassword,
      isVerified: true,
      isProfileComplete: true,
      headline: "[Demo Reviewer] Staff Infrastructure Architect · Ex-IIITD",
      bio: "Principal systems auditor and staff engineer. Evaluating student open-source deliverables with Ed25519 cryptographic reviews.",
      skills: ["Security Auditing", "Ed25519", "Raft Consensus", "Go", "Architecture"],
      institution: "IIIT Delhi",
      graduationYear: 2019,
      isAvailableForMentoring: true,
      willingToRefer: true,
    },
    create: {
      email: "alumni.demo@wavesync.io",
      password: defaultPassword,
      role: "alumni",
      fullName: "Sarah Lin (Demo Reviewer)",
      isVerified: true,
      isProfileComplete: true,
      headline: "[Demo Reviewer] Staff Infrastructure Architect · Ex-IIITD",
      bio: "Principal systems auditor and staff engineer. Evaluating student open-source deliverables with Ed25519 cryptographic reviews.",
      skills: ["Security Auditing", "Ed25519", "Raft Consensus", "Go", "Architecture"],
      institution: "IIIT Delhi",
      graduationYear: 2019,
      isAvailableForMentoring: true,
      willingToRefer: true,
      alumniDetails: {
        company: "Stripe",
        role: "Staff Infrastructure Architect",
        skills: ["Security Auditing", "Ed25519", "Raft Consensus", "Go", "Architecture"],
        experienceYears: 6,
        isAvailableForMentoring: true,
      },
    },
  });

  // 3. Demo Founder / Venture Lead
  const founder = await prisma.user.upsert({
    where: { email: "founder.demo@wavesync.io" },
    update: {
      password: defaultPassword,
      isVerified: true,
      isProfileComplete: true,
      headline: "[Demo Founder] Co-Founder @ HyperState Labs",
      bio: "Building verifiable state engines and peer-to-peer compute layers. Seeking technical co-founders with strong Rust/WASM capabilities.",
      skills: ["Venture Strategy", "Product Architecture", "GTM", "Fundraising"],
      institution: "IIT Delhi",
      graduationYear: 2018,
    },
    create: {
      email: "founder.demo@wavesync.io",
      password: defaultPassword,
      role: "company",
      fullName: "Marcus Vance (Demo Founder)",
      isVerified: true,
      isProfileComplete: true,
      headline: "[Demo Founder] Co-Founder @ HyperState Labs",
      bio: "Building verifiable state engines and peer-to-peer compute layers. Seeking technical co-founders with strong Rust/WASM capabilities.",
      skills: ["Venture Strategy", "Product Architecture", "GTM", "Fundraising"],
      institution: "IIT Delhi",
      graduationYear: 2018,
      companyDetails: {
        companyName: "HyperState Labs [Simulated Venture]",
        industry: "Developer Infrastructure",
        website: "https://wavesync.io",
      },
    },
  });

  // 4. Ensure a Pending Submission exists for live demo review
  const pendingTitle = "[Demo Benchmark] Verifiable WASM Execution Runtime";
  const existingPending = await prisma.submission.findFirst({
    where: { title: pendingTitle },
  });

  if (!existingPending) {
    await prisma.submission.create({
      data: {
        authorId: student.id,
        title: pendingTitle,
        description: "Zero-overhead WebAssembly execution sandbox with cryptographic evidence digest and reproducible latency benchmarks.",
        proofUrl: "https://github.com/wavesync-audits/wasm-runtime-benchmarks",
        proofType: "github",
        status: "pending",
      },
    });
    console.log("  ✔ Created actionable pending submission for live review demonstration.");
  }

  // 5. Ensure a Collab Post exists for co-founder recruitment demo
  const collabTitle = "[Demo Venture] HyperMesh — Verifiable Edge State Engine";
  const existingCollab = await prisma.collabPost.findFirst({
    where: { title: collabTitle },
  });

  if (!existingCollab) {
    await prisma.collabPost.create({
      data: {
        authorId: founder.id,
        title: collabTitle,
        description: "Building an open, verifiable compute layer for latency-critical distributed agents. Seeking a systems lead with Rust and WebAssembly skills.",
        type: "Prototype Stage",
        roles: ["Rust", "WebAssembly", "Distributed Systems", "P2P Networking"],
        isActive: true,
      },
    });
    console.log("  ✔ Created sample venture collab post for founder matching demonstration.");
  }

  console.log("✅ Demo dataset confirmed successfully!");
  console.log(`   • Student Demo: student.demo@wavesync.io / Password@123`);
  console.log(`   • Alumni Demo:  alumni.demo@wavesync.io  / Password@123`);
  console.log(`   • Founder Demo: founder.demo@wavesync.io / Password@123`);
}

// Execute if run directly
if (process.argv[1]?.endsWith("seedDemo.js")) {
  seedDemoData()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("Demo seeding error:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}
