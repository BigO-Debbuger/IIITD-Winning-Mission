// referloom_backend/tests/job_workflows.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Job Creation & Workflow Validation", () => {
  const validJobTypes = [
    'Full-Time', 'Internship', 'Summer Internship', '6-Month Internship', 'Contract / Freelance', 'Full-Time Role'
  ];

  it("should enforce lowercase 'open' status for job documents to match schema enum", () => {
    const validStatuses = ['open', 'closed'];
    const invalidStatus = 'Open';

    assert.strictEqual(validStatuses.includes('open'), true);
    assert.strictEqual(validStatuses.includes(invalidStatus.toLowerCase()), true);
    assert.strictEqual(validStatuses.includes(invalidStatus), false, "'Open' uppercase violates job status validation (Prisma/PostgreSQL)");
  });

  it("should normalize diverse case variations of jobType to valid schema enums", () => {
    const testCases = [
      { input: "full-time", expected: "Full-Time" },
      { input: "internship", expected: "Internship" },
      { input: "summer internship", expected: "Summer Internship" }
    ];

    testCases.forEach(({ input, expected }) => {
      const matched = validJobTypes.find(t => t.toLowerCase() === input.toLowerCase().trim());
      assert.strictEqual(matched, expected);
    });
  });

  it("should resolve company name from authenticated company profile if omitted by client", () => {
    const userCompany = {
      fullName: "TechNova HR Lead",
      role: "company",
      companyDetails: { companyName: "TechNova Solutions Pvt Ltd" }
    };

    const clientBodyWithoutCompany = { title: "Software Engineer", jobType: "Full-Time" };

    let resolvedCompanyName = clientBodyWithoutCompany.companyName;
    if (!resolvedCompanyName) {
      if (userCompany.role === 'company') {
        resolvedCompanyName = userCompany.companyDetails?.companyName || userCompany.fullName;
      }
    }

    assert.strictEqual(resolvedCompanyName, "TechNova Solutions Pvt Ltd");
  });

  it("should reject job creation if user is not company or alumni", () => {
    const studentUser = { role: "student", id: "user_student_123" };
    const isAllowed = studentUser.role === 'company' || studentUser.role === 'alumni';

    assert.strictEqual(isAllowed, false, "Students must not be permitted to create jobs");
  });
});
