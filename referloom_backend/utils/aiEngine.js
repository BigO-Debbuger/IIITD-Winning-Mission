// referloom_backend/utils/aiEngine.js
// Dynamic imports for optional external dependencies
let GoogleGenerativeAI = null;
try {
  const genAiModule = await import("@google/generative-ai");
  GoogleGenerativeAI = genAiModule.GoogleGenerativeAI;
} catch (e) {
  // @google/generative-ai is not installed in the current environment
}

try {
  const dotenv = await import("dotenv");
  dotenv.default?.config?.();
} catch (e) {
  // dotenv not installed; relying on process.env
}

// ==============================================================================
// 1. SAFE GEMINI INITIALIZATION (Lazy / Optional)
// ==============================================================================
let geminiModel = null;
const isGeminiConfigured = Boolean(
  GoogleGenerativeAI && 
  process.env.GEMINI_API_KEY && 
  process.env.GEMINI_API_KEY.trim() !== ""
);

if (isGeminiConfigured) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
  } catch (err) {
    console.warn("⚠️ Failed to initialize GoogleGenerativeAI:", err.message);
  }
}

// ==============================================================================
// 2. DETERMINISTIC SKILL & TEXT NORMALIZATION UTILITIES
// ==============================================================================
export const normalizeTerm = (term) => {
  if (!term || typeof term !== "string") return "";
  return term.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
};

const SKILL_SYNONYMS = {
  js: ["javascript", "js", "es6"],
  javascript: ["javascript", "js", "es6"],
  ts: ["typescript", "ts"],
  typescript: ["typescript", "ts"],
  react: ["react", "reactjs", "reactnative"],
  reactnative: ["react", "reactnative", "mobile"],
  node: ["node", "nodejs", "express", "backend"],
  nodejs: ["node", "nodejs", "express", "backend"],
  express: ["express", "node", "nodejs", "backend"],
  mongo: ["mongo", "mongodb", "nosql", "database"],
  mongodb: ["mongo", "mongodb", "nosql", "database"],
  sql: ["sql", "mysql", "postgresql", "postgres", "sqlite"],
  python: ["python", "py", "django", "flask", "fastapi"],
  ml: ["machinelearning", "ml", "ai", "deeplearning", "data"],
  machinelearning: ["machinelearning", "ml", "ai", "deeplearning"],
  docker: ["docker", "containers", "devops"],
  aws: ["aws", "cloud", "amazonwebservices"],
  html: ["html", "html5", "frontend"],
  css: ["css", "css3", "tailwind", "bootstrap", "frontend"],
  tailwind: ["tailwind", "tailwindcss", "css"],
  figma: ["figma", "ui", "ux", "uiux", "design"]
};

export const areSkillsCompatible = (candidateSkill, requirement) => {
  const normCandidate = normalizeTerm(candidateSkill);
  const normReq = normalizeTerm(requirement);

  if (!normCandidate || !normReq) return false;
  if (normCandidate === normReq) return true;
  if (normCandidate.includes(normReq) || normReq.includes(normCandidate)) return true;

  const candidateSynonyms = SKILL_SYNONYMS[normCandidate] || [normCandidate];
  const reqSynonyms = SKILL_SYNONYMS[normReq] || [normReq];

  return candidateSynonyms.some((syn) => reqSynonyms.includes(syn));
};

// ==============================================================================
// 3. DETERMINISTIC PROFILE STRENGTH ANALYZER
// ==============================================================================
export const calculateDeterministicProfileStrength = (user) => {
  if (!user) {
    return { score: 20, suggestions: ["Please create an account to start building your career profile."] };
  }

  let score = 0;
  const suggestions = [];

  // 1. Identity & Bio (25 points)
  if (user.fullName && user.fullName.trim().length > 0) score += 5;
  if (user.headline && user.headline.trim().length > 5) {
    score += 10;
  } else {
    suggestions.push("Add a targeted professional headline (e.g. 'Full-Stack Developer | React & Node.js').");
  }

  if (user.bio && user.bio.trim().length > 20) {
    score += 10;
  } else {
    suggestions.push("Write a concise bio summarizing your technical strengths and career aspirations.");
  }

  // 2. Skills Portfolio (25 points)
  const skills = user.studentDetails?.skills || user.skills || [];
  if (skills.length >= 5) {
    score += 25;
  } else if (skills.length >= 3) {
    score += 15;
    suggestions.push("Add at least 2 more core technical skills to broaden job matching.");
  } else if (skills.length >= 1) {
    score += 8;
    suggestions.push("List at least 5 technical skills to increase recruiter visibility.");
  } else {
    suggestions.push("Add your technical skills (languages, frameworks, tools) to enable automated matching.");
  }

  // 3. Projects Portfolio (25 points)
  const projects = user.projects || [];
  if (projects.length >= 2) {
    score += 25;
  } else if (projects.length === 1) {
    score += 15;
    suggestions.push("Add a second project (with a live link or GitHub repo) to showcase versatility.");
  } else {
    suggestions.push("Upload at least one software project to provide proof of work to employers.");
  }

  // 4. Experience & Career Goals (25 points)
  const experience = user.studentDetails?.experience || [];
  const careerPreferences = user.studentDetails?.careerPreferences || {};
  const hasGoals = careerPreferences.fields && careerPreferences.fields.length > 0;

  if (experience.length > 0) score += 15;
  else suggestions.push("Add internship, freelance, or academic club experience to strengthen work history.");

  if (hasGoals) score += 10;
  else suggestions.push("Set your Target Career Goals in your dashboard to generate custom roadmaps.");

  // Cap score between 10 and 100
  const finalScore = Math.min(100, Math.max(15, score));

  // Ensure exactly 3 actionable suggestions
  const defaultSuggestions = [
    "Connect with alumni in your target industry for mentorship reviews.",
    "Contribute to open-source or hackathons on the Collaboration Board.",
    "Regularly update your project portfolio as you learn new frameworks."
  ];

  while (suggestions.length < 3) {
    const nextDefault = defaultSuggestions.shift();
    if (nextDefault) suggestions.push(nextDefault);
    else break;
  }

  return {
    score: finalScore,
    suggestions: suggestions.slice(0, 3)
  };
};

// ==============================================================================
// 4. DETERMINISTIC JOB MATCH CALCULATOR
// ==============================================================================
export const calculateDeterministicJobMatch = (user, job) => {
  if (!job) return { fitScore: 0, suggestions: ["Job details unavailable."] };
  if (!user) return { fitScore: 0, suggestions: ["Candidate profile unavailable."] };

  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const candidateSkills = Array.isArray(user.studentDetails?.skills) ? user.studentDetails.skills : [];
  const candidateProjects = Array.isArray(user.projects) ? user.projects : [];

  // Project technology corpus
  const projectTechs = [];
  candidateProjects.forEach((p) => {
    if (Array.isArray(p.technologies)) projectTechs.push(...p.technologies);
    if (Array.isArray(p.tags)) projectTechs.push(...p.tags);
  });

  const allCandidateSkills = [...new Set([...candidateSkills, ...projectTechs])];

  if (requirements.length === 0) {
    return {
      fitScore: 75,
      suggestions: ["Role has broad requirements; suitable for candidates matching the domain."]
    };
  }

  const matchedSkills = [];
  const missingSkills = [];

  requirements.forEach((req) => {
    const isMatched = allCandidateSkills.some((cSkill) => areSkillsCompatible(cSkill, req));
    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const matchRatio = matchedSkills.length / requirements.length;
  let rawScore = Math.round(matchRatio * 75); // up to 75% based purely on requirement coverage

  // Bonus for relevant project titles/descriptions (up to 15%)
  const jobTitleNorm = normalizeTerm(job.title);
  const hasRelevantProject = candidateProjects.some((p) => {
    const pTitle = normalizeTerm(p.title);
    const pDesc = normalizeTerm(p.description);
    return (
      (jobTitleNorm && pTitle.includes(jobTitleNorm)) ||
      matchedSkills.some((s) => pDesc.includes(normalizeTerm(s)))
    );
  });
  if (hasRelevantProject) rawScore += 15;

  // Bonus for matching career preferences (up to 10%)
  const targetFields = user.studentDetails?.careerPreferences?.fields || [];
  const isGoalAligned = targetFields.some((field) => {
    const normF = normalizeTerm(field);
    return normF && (jobTitleNorm.includes(normF) || normF.includes(jobTitleNorm));
  });
  if (isGoalAligned) rawScore += 10;

  const finalFitScore = Math.min(99, Math.max(15, rawScore));

  const suggestions = [];
  if (matchedSkills.length > 0) {
    suggestions.push(`Direct skill match on: ${matchedSkills.slice(0, 3).join(", ")}.`);
  }
  if (missingSkills.length > 0) {
    suggestions.push(`Missing role requirements: ${missingSkills.slice(0, 3).join(", ")}.`);
  } else {
    suggestions.push("Candidate meets or exceeds all listed core technical requirements.");
  }

  return {
    fitScore: finalFitScore,
    suggestions: suggestions.slice(0, 2)
  };
};

// ==============================================================================
// 5. DETERMINISTIC CAREER ROADMAP GENERATOR
// ==============================================================================
export const generateDeterministicCareerRoadmap = (user) => {
  const targetFields = user?.studentDetails?.careerPreferences?.fields || [];
  const targetField = targetFields[0] || "Software Engineering";
  const skills = user?.studentDetails?.skills || [];

  return [
    `Step 1: Solidify foundational technologies required for ${targetField}. Focus on key industry standards.`,
    `Step 2: Build and deploy a production-grade capstone project integrating ${skills.slice(0, 2).join(" and ") || "modern frameworks"}.`,
    `Step 3: Publish documented code repositories with clean READMEs, tests, and active CI/CD pipelines.`,
    `Step 4: Engage with verified mentors on Referloom for targeted resume feedback and technical interview prep.`
  ];
};

// ==============================================================================
// 6. EXPORTED PUBLIC API (Hybrid: Instant Deterministic + Optional Gemini)
// ==============================================================================

// Fast, non-blocking profile strength calculation (Used across all user list and profile endpoints)
export const calculateProfileStrength = async (user) => {
  const deterministic = calculateDeterministicProfileStrength(user);
  return deterministic;
};

// Fast deterministic job match calculator (Used across all job list and search endpoints)
export const calculateJobMatch = async (user, job) => {
  const deterministic = calculateDeterministicJobMatch(user, job);
  return deterministic;
};

// On-demand LLM enhancement with strict timeout and fallback
export const calculateJobMatchDeepInsight = async (user, job) => {
  const deterministic = calculateDeterministicJobMatch(user, job);

  if (!isGeminiConfigured || !geminiModel) {
    return deterministic;
  }

  try {
    const prompt = `
      You are an ATS technical recruiter AI. Compare the candidate's skills and projects against the job requirements.
      Candidate Skills: ${JSON.stringify(user.studentDetails?.skills || [])}
      Candidate Projects: ${JSON.stringify(user.projects?.map((p) => ({ title: p.title, tech: p.technologies })) || [])}
      Job Title: ${job.title}
      Job Requirements: ${JSON.stringify(job.requirements || [])}

      Return ONLY valid JSON:
      {
        "fitScore": ${deterministic.fitScore},
        "suggestions": ["Specific reason 1", "Specific reason 2"]
      }
    `;

    // Timeout external AI call after 3000ms
    const aiPromise = geminiModel.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), 3000)
    );

    const result = await Promise.race([aiPromise, timeoutPromise]);
    const parsed = JSON.parse(result.response.text());

    return {
      fitScore: typeof parsed.fitScore === "number" ? Math.min(99, Math.max(10, parsed.fitScore)) : deterministic.fitScore,
      suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions.slice(0, 2) : deterministic.suggestions
    };
  } catch (error) {
    // Graceful fallback to deterministic result
    return deterministic;
  }
};

// Career roadmap generator with safe fallback
export const generateCareerRoadmap = async (user) => {
  const deterministic = generateDeterministicCareerRoadmap(user);

  if (!isGeminiConfigured || !geminiModel) {
    return deterministic;
  }

  try {
    const targetFields = user?.studentDetails?.careerPreferences?.fields || [];
    const prompt = `
      You are an elite career mentor. Create a 4-step actionable roadmap for a student aiming for: ${JSON.stringify(targetFields)}.
      Current Skills: ${JSON.stringify(user.studentDetails?.skills || [])}
      Return ONLY a valid JSON array of 4 short strings: ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."]
    `;

    const aiPromise = geminiModel.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), 3000)
    );

    const result = await Promise.race([aiPromise, timeoutPromise]);
    const parsed = JSON.parse(result.response.text());

    if (Array.isArray(parsed) && parsed.length >= 2) {
      return parsed.slice(0, 4);
    }
    return deterministic;
  } catch (error) {
    return deterministic;
  }
};