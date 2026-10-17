// referloom_backend/tests/aiEngine.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeTerm,
  areSkillsCompatible,
  calculateDeterministicJobMatch,
  calculateDeterministicProfileStrength,
  generateDeterministicCareerRoadmap
} from "../utils/aiEngine.js";

describe("AI Matching Engine - Deterministic Calculations", () => {
  it("should normalize terms correctly by removing whitespace and special characters", () => {
    assert.strictEqual(normalizeTerm(" Node.js "), "nodejs");
    assert.strictEqual(normalizeTerm("React-Native!"), "reactnative");
    assert.strictEqual(normalizeTerm("C++"), "c");
    assert.strictEqual(normalizeTerm(null), "");
  });

  it("should identify compatible skills and framework synonyms", () => {
    assert.strictEqual(areSkillsCompatible("React", "reactjs"), true);
    assert.strictEqual(areSkillsCompatible("Node.js", "Express"), true);
    assert.strictEqual(areSkillsCompatible("MongoDB", "NoSQL"), true);
    assert.strictEqual(areSkillsCompatible("Python", "Docker"), false);
  });

  it("should calculate high fitScore for candidate matching all requirements", () => {
    const student = {
      studentDetails: {
        skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript"],
        careerPreferences: { fields: ["Full Stack (MERN)"] }
      },
      projects: [
        {
          title: "E-Commerce Web App",
          description: "Full stack MERN store with React and Node.js",
          technologies: ["React", "Node.js", "MongoDB"]
        }
      ]
    };

    const job = {
      title: "Junior MERN Stack Engineer",
      requirements: ["React", "Node.js", "Express", "MongoDB"],
      jobType: "Full-Time"
    };

    const match = calculateDeterministicJobMatch(student, job);
    assert.ok(match.fitScore >= 85, `Expected fitScore >= 85, got ${match.fitScore}`);
    assert.ok(match.suggestions.length > 0, "Expected actionable suggestions");
    assert.ok(match.suggestions[0].includes("Direct skill match"), "Expected match reason");
  });

  it("should calculate lower fitScore and identify missing skills for partial match", () => {
    const student = {
      studentDetails: {
        skills: ["HTML", "CSS", "Java"],
        careerPreferences: { fields: ["Data Science"] }
      },
      projects: []
    };

    const job = {
      title: "Data Science Intern",
      requirements: ["Python", "SQL", "Pandas", "Machine Learning"],
      jobType: "Internship"
    };

    const match = calculateDeterministicJobMatch(student, job);
    assert.ok(match.fitScore <= 40, `Expected fitScore <= 40, got ${match.fitScore}`);
    assert.ok(
      match.suggestions.some(s => s.includes("Missing role requirements")),
      "Expected missing skills in suggestions"
    );
  });

  it("should score profile strength based on completeness", () => {
    const emptyStudent = {
      fullName: "Incomplete User",
      headline: "",
      bio: "",
      studentDetails: { skills: [], experience: [] },
      projects: []
    };

    const weakResult = calculateDeterministicProfileStrength(emptyStudent);
    assert.ok(weakResult.score <= 30, `Expected score <= 30, got ${weakResult.score}`);
    assert.strictEqual(weakResult.suggestions.length, 3, "Expected 3 improvement suggestions");

    const completeStudent = {
      fullName: "Aarav Sharma",
      headline: "Senior Full-Stack MERN Developer",
      bio: "Passionate developer with hands-on production experience in high-performance web applications.",
      studentDetails: {
        skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript", "Docker"],
        experience: [{ company: "TechCorp", role: "Intern" }],
        careerPreferences: { fields: ["Full Stack"] }
      },
      projects: [
        { title: "Project A", technologies: ["React"] },
        { title: "Project B", technologies: ["Node.js"] }
      ]
    };

    const strongResult = calculateDeterministicProfileStrength(completeStudent);
    assert.ok(strongResult.score >= 90, `Expected score >= 90, got ${strongResult.score}`);
  });

  it("should generate deterministic career roadmap steps", () => {
    const student = {
      studentDetails: {
        skills: ["React", "Node.js"],
        careerPreferences: { fields: ["Backend Engineering"] }
      }
    };

    const roadmap = generateDeterministicCareerRoadmap(student);
    assert.strictEqual(Array.isArray(roadmap), true);
    assert.strictEqual(roadmap.length, 4);
    assert.ok(roadmap[0].includes("Step 1:"));
    assert.ok(roadmap[0].includes("Backend Engineering"));
  });
});
