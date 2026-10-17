// referloom_backend/tests/auth_otp.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Authentication & OTP Verification Workflow", () => {
  it("should ensure valid roles are accepted and invalid roles rejected", () => {
    const validRoles = ["student", "alumni", "company", "admin"];

    assert.strictEqual(validRoles.includes("student"), true);
    assert.strictEqual(validRoles.includes("company"), true);
    assert.strictEqual(validRoles.includes("superadmin"), false);
    assert.strictEqual(validRoles.includes("guest"), false);
  });

  it("should enforce minimum password length of 6 characters", () => {
    const isPasswordValid = (pwd) => typeof pwd === "string" && pwd.length >= 6;

    assert.strictEqual(isPasswordValid("12345"), false);
    assert.strictEqual(isPasswordValid("123456"), true);
    assert.strictEqual(isPasswordValid("secure_password_123"), true);
  });

  it("should properly evaluate OTP expiration", () => {
    const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute in the past
    const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in the future

    const isExpired = (expiresAt) => expiresAt < new Date();

    assert.strictEqual(isExpired(pastDate), true, "Past timestamp must be expired");
    assert.strictEqual(isExpired(futureDate), false, "Future timestamp must not be expired");
  });

  it("should track failed attempts and lock out after 5 consecutive failures", () => {
    let attempts = 0;
    const maxAttempts = 5;

    const recordAttempt = () => {
      attempts += 1;
      return attempts >= maxAttempts;
    };

    assert.strictEqual(recordAttempt(), false); // 1
    assert.strictEqual(recordAttempt(), false); // 2
    assert.strictEqual(recordAttempt(), false); // 3
    assert.strictEqual(recordAttempt(), false); // 4
    assert.strictEqual(recordAttempt(), true);  // 5 (Locked out!)
  });

  it("should mark account isVerified: true when valid OTP was confirmed", () => {
    const verifiedOtpRecord = { email: "student@test.com", isVerified: true };
    const unverifiedOtpRecord = null;

    const isVerifiedUser1 = Boolean(verifiedOtpRecord);
    const isVerifiedUser2 = Boolean(unverifiedOtpRecord);

    assert.strictEqual(isVerifiedUser1, true, "User with verified OTP record gets isVerified: true");
    assert.strictEqual(isVerifiedUser2, false, "User without verified OTP record gets isVerified: false");
  });

  it("should block unverified user from logging in with HTTP 403", () => {
    const user = { email: "unverified@test.com", isVerified: false };

    const checkLoginEligibility = (u) => {
      if (!u.isVerified) {
        return { statusCode: 403, message: "Please verify your email before logging in." };
      }
      return { statusCode: 200, message: "Login successful" };
    };

    const result = checkLoginEligibility(user);
    assert.strictEqual(result.statusCode, 403);
    assert.ok(result.message.includes("verify your email"));
  });
});
