// wavesync_backend/tests/postgres_integration.test.js
// End-to-end integration test suite verifying Express API routes against PostgreSQL.
// When DATABASE_URL is active, this suite executes real HTTP operations against the Express app.
process.env.NODE_ENV = "test";

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import http from "node:http";
import app from "../server.js";
import { prisma } from "../config/prisma.js";

let server;
let baseUrl;
let isDbConnected = false;

// Helper to make HTTP requests against the test server
async function apiRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const fetchOptions = {
    method: options.method || "GET",
    headers,
  };
  if (options.body) {
    fetchOptions.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }
  const res = await fetch(url, fetchOptions);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, headers: res.headers, data };
}

describe("PostgreSQL Backend End-to-End API Workflows", () => {
  before(async () => {
    // 1. Check if database is reachable
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes("REPLACE_WITH_YOUR_POSTGRES_PASSWORD")) {
      try {
        await prisma.$queryRaw`SELECT 1;`;
        isDbConnected = true;
      } catch (err) {
        isDbConnected = false;
      }
    }

    // 2. Start ephemeral test HTTP server
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
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // 1. Health check & basic connectivity
  it("GET / should return healthy status string", async () => {
    const res = await apiRequest("/");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data, "WaveSync API is running...");
  });

  // 2. Unauthorized access protection (Error responses & auth enforcement)
  it("GET /api/jobs/mine without auth token should return HTTP 401", async () => {
    const res = await apiRequest("/api/jobs/mine");
    assert.strictEqual(res.status, 401);
  });

  it("GET /api/admin/pending without auth token should return HTTP 401", async () => {
    const res = await apiRequest("/api/admin/pending");
    assert.strictEqual(res.status, 401);
  });

  it("POST /api/upload without auth token should return HTTP 401", async () => {
    const res = await apiRequest("/api/upload", { method: "POST" });
    assert.strictEqual(res.status, 401);
  });

  it("POST /api/projects without auth token should return HTTP 401", async () => {
    const res = await apiRequest("/api/projects", { method: "POST", body: { title: "Test" } });
    assert.strictEqual(res.status, 401);
  });

  it("POST /api/referrals/refer without auth token should return HTTP 401", async () => {
    const res = await apiRequest("/api/referrals/refer", { method: "POST", body: {} });
    assert.strictEqual(res.status, 401);
  });

  it("POST /api/mentorship/request without auth token should return HTTP 401", async () => {
    const res = await apiRequest("/api/mentorship/request", { method: "POST", body: {} });
    assert.strictEqual(res.status, 401);
  });

  it("POST /api/collab without auth token should return HTTP 401", async () => {
    const res = await apiRequest("/api/collab", { method: "POST", body: {} });
    assert.strictEqual(res.status, 401);
  });

  // 3. Live DB-gated tests (Only run if real PostgreSQL is connected)
  it("Live DB workflow verification (Requires active DATABASE_URL)", async (t) => {
    if (!isDbConnected) {
      t.skip("PostgreSQL live connection not yet configured. Skipping live database operations until credentials are provided.");
      return;
    }

    // 1. User Registration
    const studentEmail = `student_${Date.now()}@wavesync.test`;
    const regRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: {
        fullName: "Test Student",
        email: studentEmail,
        password: "password123",
        role: "student",
      },
    });
    assert.strictEqual(regRes.status === 201 || regRes.status === 200, true);

    // 2. Duplicate registration prevention
    const dupRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: {
        fullName: "Duplicate Student",
        email: studentEmail,
        password: "password123",
        role: "student",
      },
    });
    assert.strictEqual(dupRes.status, 400);

    // 3. Clean up test record
    await prisma.user.deleteMany({ where: { email: studentEmail } });
  });

  // 4. Web Authentication & Full OTP Verification Lifecycle
  it("Web Auth & OTP verification lifecycle (Register, OTP, Login, Security)", async (t) => {
    if (!isDbConnected) {
      t.skip("PostgreSQL live connection not active");
      return;
    }

    const testEmail = `webuser_${Date.now()}@wavesync.test`;

    // A. Password length validation
    const shortPwdRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "Short Pwd", email: testEmail, password: "123", role: "student" },
    });
    assert.strictEqual(shortPwdRes.status, 400);
    assert.ok(shortPwdRes.data.message.includes("6 characters"));

    // B. Invalid role validation
    const badRoleRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "Bad Role", email: testEmail, password: "validpassword", role: "superadmin" },
    });
    assert.strictEqual(badRoleRes.status, 400);
    assert.ok(badRoleRes.data.message.includes("Invalid role"));

    // C. Dispatch OTP
    const sendRes = await apiRequest("/api/otp/send", {
      method: "POST",
      body: { email: testEmail },
    });
    assert.strictEqual(sendRes.status, 200);
    const otpCode = sendRes.data.devOtp;
    assert.ok(otpCode, "devOtp must be returned in test/dev environment");

    // D. Verify OTP
    const verifyRes = await apiRequest("/api/otp/verify-otp", {
      method: "POST",
      body: { email: testEmail, otp: otpCode },
    });
    assert.strictEqual(verifyRes.status, 200);
    assert.strictEqual(verifyRes.data.success, true);

    // E. Register verified user
    const regRes = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "Web Verified User", email: testEmail, password: "validpassword123", role: "student" },
    });
    assert.strictEqual(regRes.status, 201);
    assert.ok(regRes.data.token, "Token must be returned on registration");
    assert.strictEqual(regRes.data.user.email, testEmail);
    assert.strictEqual(regRes.data.user.password, undefined, "Password must not be returned in user payload");
    assert.strictEqual(regRes.data.user.isVerified, true, "User must be marked isVerified: true");

    // F. Login with correct credentials
    const loginRes = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email: testEmail, password: "validpassword123" },
    });
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginRes.data.token, "Login must return JWT token");
    assert.strictEqual(loginRes.data.user.password, undefined);

    // G. Login rejection with wrong password
    const badLoginRes = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email: testEmail, password: "wrong_password" },
    });
    assert.strictEqual(badLoginRes.status, 401);

    // H. Unverified user rejection
    const unverifiedEmail = `unverified_${Date.now()}@wavesync.test`;
    await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName: "Unverified User", email: unverifiedEmail, password: "validpassword123", role: "student" },
    });
    const unverifiedLoginRes = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email: unverifiedEmail, password: "validpassword123" },
    });
    assert.strictEqual(unverifiedLoginRes.status, 403);
    assert.ok(unverifiedLoginRes.data.message.includes("verify your email"));

    // Cleanup
    await prisma.user.deleteMany({ where: { email: { in: [testEmail, unverifiedEmail] } } });
    await prisma.otp.deleteMany({ where: { email: { in: [testEmail, unverifiedEmail] } } });
  });
});
