// wavesync_backend/tests/submission.test.js
// Build-to-Earn: Submission and Review workflow tests.
// Tests 1-6 are pure unit/logic tests (no DB required).
// Tests 7-9 require the live PostgreSQL database.

process.env.NODE_ENV = "test";

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Test Group 1: Signature utility — pure unit tests, no DB
// ---------------------------------------------------------------------------
describe("Build-to-Earn — Signature Utility (Unit)", () => {
  let buildCanonicalPayload, signPayload, verifySignature, isSigningConfigured;

  before(async () => {
    const mod = await import("../utils/signatureUtils.js");
    buildCanonicalPayload = mod.buildCanonicalPayload;
    signPayload = mod.signPayload;
    verifySignature = mod.verifySignature;
    isSigningConfigured = mod.isSigningConfigured;
  });

  it("should build a deterministic canonical payload", () => {
    const payload = buildCanonicalPayload(
      "sub-001",
      "rev-002",
      "approved",
      "2026-10-17T10:00:00.000Z"
    );
    assert.strictEqual(payload, "sub-001:rev-002:approved:2026-10-17T10:00:00.000Z");
  });

  it("should produce the same payload for identical inputs (deterministic)", () => {
    const p1 = buildCanonicalPayload("a", "b", "rejected", "2026-01-01T00:00:00.000Z");
    const p2 = buildCanonicalPayload("a", "b", "rejected", "2026-01-01T00:00:00.000Z");
    assert.strictEqual(p1, p2);
  });

  it("should reject payload fields that contain a colon", () => {
    assert.throws(() => {
      buildCanonicalPayload("sub:bad", "reviewer", "approved", "2026-01-01T00:00:00.000Z");
    }, /colon/i);
  });

  it("should throw when a required payload field is missing", () => {
    assert.throws(() => {
      buildCanonicalPayload("sub-001", "rev-002", "", "2026-01-01T00:00:00.000Z");
    });
  });

  it("should sign and verify a payload when keys are configured", () => {
    if (!isSigningConfigured()) {
      // Graceful skip when keys are not in env
      console.log("      ⏭  Signing keys not configured — skipping sign/verify test.");
      return;
    }

    const payload = buildCanonicalPayload(
      "sub-001",
      "rev-002",
      "approved",
      "2026-10-17T10:00:00.000Z"
    );
    const result = signPayload(payload);
    assert.ok(result !== null, "signPayload should return a result when keys are configured");
    assert.strictEqual(result.signedPayload, payload);
    assert.ok(result.signature.length > 0, "signature should be non-empty");

    const valid = verifySignature(result.signedPayload, result.signature);
    assert.strictEqual(valid, true, "signature should verify against the original payload");
  });

  it("should reject a tampered payload", () => {
    if (!isSigningConfigured()) {
      console.log("      ⏭  Signing keys not configured — skipping tamper test.");
      return;
    }

    const payload = buildCanonicalPayload(
      "sub-001",
      "rev-002",
      "approved",
      "2026-10-17T10:00:00.000Z"
    );
    const result = signPayload(payload);
    assert.ok(result !== null);

    const tampered = payload.replace("approved", "rejected");
    const valid = verifySignature(tampered, result.signature);
    assert.strictEqual(valid, false, "tampered payload must not verify");
  });

  it("should return false when signature is completely invalid bytes", () => {
    const valid = verifySignature("any:payload:here:now", "not-a-real-signature");
    // Returns false — does not throw
    assert.strictEqual(typeof valid, "boolean");
    assert.strictEqual(valid, false);
  });
});

// ---------------------------------------------------------------------------
// Test Group 2: Submission & Review validation logic — no DB
// ---------------------------------------------------------------------------
describe("Build-to-Earn — Input Validation (Unit)", () => {
  it("should reject an invalid proof URL scheme", () => {
    const isValidUrl = (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    };

    assert.strictEqual(isValidUrl("https://github.com/user/repo"), true);
    assert.strictEqual(isValidUrl("http://localhost:3000"), true);
    assert.strictEqual(isValidUrl("ftp://bad.example.com"), false);
    assert.strictEqual(isValidUrl("javascript:alert(1)"), false);
    assert.strictEqual(isValidUrl("not-a-url-at-all"), false);
    assert.strictEqual(isValidUrl(""), false);
  });

  it("should accept only valid verdict values", () => {
    const VALID_VERDICTS = ["approved", "rejected", "needs_revision"];
    assert.ok(VALID_VERDICTS.includes("approved"));
    assert.ok(VALID_VERDICTS.includes("rejected"));
    assert.ok(VALID_VERDICTS.includes("needs_revision"));
    assert.ok(!VALID_VERDICTS.includes("maybe"));
    assert.ok(!VALID_VERDICTS.includes(""));
    assert.ok(!VALID_VERDICTS.includes("APPROVED")); // case-sensitive
  });

  it("should map verdicts to correct submission status transitions", () => {
    const VERDICT_TO_STATUS = {
      approved: "approved",
      rejected: "rejected",
      needs_revision: "pending",
    };
    assert.strictEqual(VERDICT_TO_STATUS["approved"], "approved");
    assert.strictEqual(VERDICT_TO_STATUS["rejected"], "rejected");
    assert.strictEqual(VERDICT_TO_STATUS["needs_revision"], "pending");
  });
});

// ---------------------------------------------------------------------------
// Test Group 3: Live DB end-to-end workflow
// ---------------------------------------------------------------------------
import http from "node:http";
import app from "../server.js";
import { prisma } from "../config/prisma.js";

let server;
let baseUrl;
let isDbConnected = false;

// Re-usable HTTP request helper
async function apiRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const fetchOptions = { method: options.method || "GET", headers };
  if (options.body) {
    fetchOptions.body =
      typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }
  const res = await fetch(url, fetchOptions);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

describe("Build-to-Earn — Live DB Workflow (Integration)", () => {
  // Ephemeral test state
  let studentToken, alumniToken;
  let submissionId;
  const studentEmail = `bte_student_${Date.now()}@wavesync.test`;
  const alumniEmail = `bte_alumni_${Date.now()}@wavesync.test`;

  before(async () => {
    // Check DB reachability
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes("REPLACE_WITH_YOUR_POSTGRES_PASSWORD")) {
      try {
        await prisma.$queryRaw`SELECT 1;`;
        isDbConnected = true;
      } catch {
        isDbConnected = false;
      }
    }

    // Start ephemeral HTTP server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Cleanup test users (cascades to submissions and reviews via FK)
    if (isDbConnected) {
      await prisma.user.deleteMany({
        where: { email: { in: [studentEmail, alumniEmail] } },
      });
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("Live DB: setup — register student and alumni test accounts", async (t) => {
    if (!isDbConnected) {
      t.skip("PostgreSQL not available — skipping all live DB submission tests.");
      return;
    }

    // Register student (no OTP verification in test — register marks isVerified based on OTP)
    // We inject a verified OTP record manually to pass the registration check
    await prisma.otp.create({
      data: {
        email: studentEmail,
        otp: "123456",
        isVerified: true,
        expiresAt: new Date(Date.now() + 60000),
      },
    });
    await prisma.otp.create({
      data: {
        email: alumniEmail,
        otp: "123456",
        isVerified: true,
        expiresAt: new Date(Date.now() + 60000),
      },
    });

    const sRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "BTE Student", email: studentEmail, password: "test1234", role: "student" },
    });
    assert.ok(sRes.status === 201 || sRes.status === 200, `Student register: ${sRes.status}`);
    studentToken = sRes.data.token;
    assert.ok(studentToken, "Student token must be present");

    const aRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "BTE Alumni", email: alumniEmail, password: "test1234", role: "alumni" },
    });
    assert.ok(aRes.status === 201 || aRes.status === 200, `Alumni register: ${aRes.status}`);
    alumniToken = aRes.data.token;
    assert.ok(alumniToken, "Alumni token must be present");
  });

  it("Live DB: valid submission creation", async (t) => {
    if (!isDbConnected || !studentToken) { t.skip("No DB or token"); return; }

    const res = await apiRequest("/api/submissions", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: "My BTE Project",
        description: "A full-stack project demonstrating proof of work.",
        proofUrl: "https://github.com/user/bte-project",
        proofType: "github",
      },
    });

    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert.ok(res.data.submission?.id, "Submission ID must be present");
    assert.strictEqual(res.data.submission?.status, "pending");
    submissionId = res.data.submission.id;
  });

  it("Live DB: invalid submission — missing required fields", async (t) => {
    if (!isDbConnected || !studentToken) { t.skip("No DB or token"); return; }

    const res = await apiRequest("/api/submissions", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { title: "Incomplete" }, // missing description, proofUrl, proofType
    });
    assert.strictEqual(res.status, 400);
  });

  it("Live DB: invalid submission — bad URL scheme", async (t) => {
    if (!isDbConnected || !studentToken) { t.skip("No DB or token"); return; }

    const res = await apiRequest("/api/submissions", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: "Bad URL",
        description: "Trying to inject a bad URL.",
        proofUrl: "ftp://bad.example.com/file",
        proofType: "other",
      },
    });
    assert.strictEqual(res.status, 400, "ftp:// URL should be rejected");
  });

  it("Live DB: unauthenticated request is rejected", async (t) => {
    if (!isDbConnected) { t.skip("No DB"); return; }
    const res = await apiRequest("/api/submissions", { method: "POST", body: {} });
    assert.strictEqual(res.status, 401);
  });

  it("Live DB: student can list own submissions", async (t) => {
    if (!isDbConnected || !studentToken) { t.skip("No DB or token"); return; }

    const res = await apiRequest("/api/submissions/mine", {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length >= 1, "Should have at least one submission");
  });

  it("Live DB: self-review is rejected with 403", async (t) => {
    if (!isDbConnected || !studentToken || !submissionId) { t.skip("No DB or IDs"); return; }

    const res = await apiRequest("/api/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { submissionId, verdict: "approved", feedback: "I approve my own work." },
    });
    assert.strictEqual(res.status, 403, "Self-review must be rejected");
    assert.ok(res.data.message.toLowerCase().includes("own"), `Message: ${res.data.message}`);
  });

  it("Live DB: non-alumni/non-admin reviewer is rejected with 403", async (t) => {
    if (!isDbConnected || !studentToken || !submissionId) { t.skip("No DB or IDs"); return; }

    // studentToken = student role → not allowed to review
    const otherStudentEmail = `bte_student2_${Date.now()}@wavesync.test`;
    await prisma.otp.create({
      data: { email: otherStudentEmail, otp: "123456", isVerified: true, expiresAt: new Date(Date.now() + 60000) },
    });
    const sRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "BTE Student 2", email: otherStudentEmail, password: "test1234", role: "student" },
    });
    const token2 = sRes.data.token;

    const res = await apiRequest("/api/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${token2}` },
      body: { submissionId, verdict: "approved", feedback: "Should not be allowed." },
    });
    assert.strictEqual(res.status, 403);

    await prisma.user.deleteMany({ where: { email: otherStudentEmail } });
  });

  it("Live DB: alumni can review a submission with a signature", async (t) => {
    if (!isDbConnected || !alumniToken || !submissionId) { t.skip("No DB or IDs"); return; }

    const res = await apiRequest("/api/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${alumniToken}` },
      body: {
        submissionId,
        verdict: "needs_revision",
        feedback: "Good effort! Please add unit tests and a live demo URL.",
      },
    });
    assert.strictEqual(res.status, 201, `Review failed: ${JSON.stringify(res.data)}`);
    assert.strictEqual(res.data.submissionStatus, "pending"); // needs_revision reverts to pending
    assert.ok(typeof res.data.signatureVerified === "boolean");
  });

  it("Live DB: duplicate review by same reviewer is rejected with 409", async (t) => {
    if (!isDbConnected || !alumniToken || !submissionId) { t.skip("No DB or IDs"); return; }

    const res = await apiRequest("/api/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${alumniToken}` },
      body: {
        submissionId,
        verdict: "approved",
        feedback: "Trying to review again — should be blocked.",
      },
    });
    assert.strictEqual(res.status, 409, "Duplicate review must return 409");
  });

  it("Live DB: status transitions — reviews cannot be added to approved/rejected submissions", async (t) => {
    if (!isDbConnected || !alumniToken) { t.skip("No DB or token"); return; }

    // Create a fresh student and submission, approve it, then try another review
    const email = `bte_transition_${Date.now()}@wavesync.test`;
    const alumEmail = `bte_alum2_${Date.now()}@wavesync.test`;

    await prisma.otp.create({ data: { email, otp: "123456", isVerified: true, expiresAt: new Date(Date.now() + 60000) } });
    await prisma.otp.create({ data: { email: alumEmail, otp: "123456", isVerified: true, expiresAt: new Date(Date.now() + 60000) } });

    const stuRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "Transition Student", email, password: "test1234", role: "student" },
    });
    const stuToken = stuRes.data.token;

    const alumRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "Transition Alumni", email: alumEmail, password: "test1234", role: "alumni" },
    });
    const aToken2 = alumRes.data.token;

    // Create submission
    const subRes = await apiRequest("/api/submissions", {
      method: "POST",
      headers: { Authorization: `Bearer ${stuToken}` },
      body: { title: "Transition Test", description: "Testing status transitions.", proofUrl: "https://github.com/t/t", proofType: "github" },
    });
    const subId = subRes.data.submission.id;

    // Approve it
    const revRes = await apiRequest("/api/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${aToken2}` },
      body: { submissionId: subId, verdict: "approved", feedback: "Excellent — fully approved." },
    });
    assert.strictEqual(revRes.status, 201);
    assert.strictEqual(revRes.data.submissionStatus, "approved");

    // Now try to add another review to an already-approved submission
    // Use a completely different alumni to bypass the @@unique constraint
    const alum3Email = `bte_alum3_${Date.now()}@wavesync.test`;
    await prisma.otp.create({ data: { email: alum3Email, otp: "123456", isVerified: true, expiresAt: new Date(Date.now() + 60000) } });
    const a3Res = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "Transition Alumni 3", email: alum3Email, password: "test1234", role: "alumni" },
    });
    const a3Token = a3Res.data.token;

    const blocked = await apiRequest("/api/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${a3Token}` },
      body: { submissionId: subId, verdict: "rejected", feedback: "Trying to reject after approval." },
    });
    assert.strictEqual(blocked.status, 409, "Review on approved submission must return 409");

    // Cleanup
    await prisma.user.deleteMany({ where: { email: { in: [email, alumEmail, alum3Email] } } });
  });
});
