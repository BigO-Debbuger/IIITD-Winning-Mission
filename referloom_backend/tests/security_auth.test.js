// referloom_backend/tests/security_auth.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authorizeRoles } from "../middlewares/authMiddleware.js";

describe("Security & Authorization Middleware Tests", () => {
  it("should allow request to proceed if user role matches authorized roles", () => {
    const middleware = authorizeRoles("company", "admin");
    const req = { user: { id: "123", role: "company" } };
    let nextCalled = false;
    const res = {
      status: () => res,
      json: () => res
    };

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, "next() should be called when role matches");
  });

  it("should block request with HTTP 403 if user role does not match", () => {
    const middleware = authorizeRoles("company", "admin");
    const req = { user: { id: "456", role: "student" } };
    let statusCode = null;
    let jsonResponse = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      }
    };

    let nextCalled = false;
    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, "next() must not be called when unauthorized");
    assert.strictEqual(statusCode, 403, "Expected HTTP 403 Forbidden");
    assert.ok(jsonResponse.message.includes("student"), "Message should mention student role");
  });

  it("should block request with HTTP 403 if user object is missing or null", () => {
    const middleware = authorizeRoles("admin");
    const req = { user: null };
    let statusCode = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: () => res
    };

    middleware(req, res, () => {});
    assert.strictEqual(statusCode, 403);
  });
});
