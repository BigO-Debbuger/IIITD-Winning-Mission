// wavesync_web/src/services/api.ts

const API_BASE = '/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'alumni' | 'company' | 'admin';
  headline?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  isVerified?: boolean;
}

export interface JobOpportunity {
  id: string;
  title: string;
  companyName?: string;
  company?: string;
  location: string;
  jobType: string;
  salaryRange?: string;
  salary?: string;
  requirements: string[];
  description: string;
  status: string;
  equity?: string;
  createdAt: string;
}

export interface CollabProject {
  id: string;
  title: string;
  description: string;
  projectStage?: string;
  skillsRequired: string[];
  status: string;
  author?: {
    id: string;
    fullName: string;
    role: string;
  };
  createdAt: string;
}

export interface SubmissionReview {
  id: string;
  verdict: 'approved' | 'rejected' | 'needs_revision';
  feedback: string;
  signature?: string;
  signatureVerified?: boolean;
  createdAt: string;
  reviewer?: {
    id?: string;
    fullName: string;
    headline?: string;
  };
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  proofUrl: string;
  proofType: 'github' | 'live' | 'pdf' | 'other' | string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
  author?: {
    id: string;
    fullName: string;
    role: string;
  };
  reviews?: SubmissionReview[];
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('wavesync_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data.message) return data.message;
      if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    } catch {
      if (text && text.length < 200 && !text.includes('<!DOCTYPE')) {
        return text;
      }
    }
  } catch {
    // Ignore parse error
  }

  if (res.status === 502 || res.status === 504 || res.status === 500) {
    return 'Cannot reach WaveSync backend (port 5001). Please verify the backend server is running.';
  }
  if (res.status === 401) return 'Invalid email or password.';
  if (res.status === 403) return 'Account is unverified or access is restricted.';
  if (res.status === 404) return 'Requested endpoint was not found on the backend.';
  return fallback;
}

// Fallback seed data in case backend database is freshly populated or empty
const FALLBACK_JOBS: JobOpportunity[] = [
  {
    id: 'job-1',
    title: 'Founding Distributed Systems Architect',
    company: 'HyperState Labs',
    companyName: 'HyperState Labs',
    location: 'Remote / SF',
    jobType: 'Full-Time',
    salary: '$160k - $210k',
    salaryRange: '$160k - $210k',
    equity: '1.5% - 3.0%',
    requirements: ['Rust', 'PostgreSQL', 'Raft Consensus', 'P2P Networking'],
    description: 'Lead the architecture of our verified multi-region state engine. Direct equity partnership with Tier-1 backed co-founders.',
    status: 'open',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-2',
    title: 'AI Evaluation & Alignment Lead',
    company: 'VeriCore Intelligence',
    companyName: 'VeriCore Intelligence',
    location: 'Remote / NYC',
    jobType: 'Full-Time',
    salary: '$150k - $190k',
    salaryRange: '$150k - $190k',
    equity: '1.0% - 2.5%',
    requirements: ['Python', 'PyTorch', 'Model Evaluation', 'RLHF'],
    description: 'Design automated proof-of-correctness frameworks for agentic systems and verifiable neural pathways.',
    status: 'open',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-3',
    title: 'Spatial UI & Creative Technologist',
    company: 'Aether Engine',
    companyName: 'Aether Engine',
    location: 'Remote / London',
    jobType: 'Contract / Freelance',
    salary: '$12k / milestone',
    salaryRange: '$12k / milestone',
    equity: '0.5%',
    requirements: ['React', 'Three.js / WebGL', 'Shader Graph', 'TypeScript'],
    description: 'Craft ultra-restrained 3D tactile interaction surfaces for next-generation developer tooling.',
    status: 'open',
    createdAt: new Date().toISOString(),
  },
];

const FALLBACK_COLLABS: CollabProject[] = [
  {
    id: 'collab-1',
    title: 'WaveMesh — Peer-to-Peer Verified Compute Layer',
    description: 'Seeking a systems co-founder to co-build decentralized verifiable proof execution for low-latency nodes.',
    projectStage: 'Prototype Stage',
    skillsRequired: ['Rust', 'Wasm', 'Distributed Systems'],
    status: 'active',
    author: { id: 'u1', fullName: 'Elena Rostova', role: 'company' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'collab-2',
    title: 'ZeroBio — Open Synthetic Biology Repository',
    description: 'Looking for a frontend craftsperson to turn bio-computational graphs into fluid interactive canvases.',
    projectStage: 'Grant-Funded',
    skillsRequired: ['TypeScript', 'Three.js', 'Canvas API', 'Bioinformatics'],
    status: 'active',
    author: { id: 'u2', fullName: 'Dr. Tariq Vance', role: 'alumni' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'collab-3',
    title: 'SolvFund — Micro-Grant Matching Protocol',
    description: 'Matching non-dilutive hackathon and research grants with verified proof-of-work builder submissions.',
    projectStage: 'Alpha',
    skillsRequired: ['Next.js', 'PostgreSQL', 'Prisma', 'Tailwind'],
    status: 'active',
    author: { id: 'u3', fullName: 'Maya Lin', role: 'student' },
    createdAt: new Date().toISOString(),
  },
];

const FALLBACK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    title: 'Verifiable Zero-Knowledge Merkle Indexer',
    description: 'Implemented recursive SNARK verification for tree state updates with sub-millisecond local generation.',
    proofUrl: 'https://github.com/wavesync/zk-indexer-core',
    proofType: 'github',
    status: 'approved',
    createdAt: new Date().toISOString(),
    author: { id: 'u-b1', fullName: 'Devon Park', role: 'student' },
    reviews: [
      {
        id: 'rev-1',
        verdict: 'approved',
        feedback: 'Exceptional test coverage and clean algorithmic implementation. Benchmark verified under heavy load.',
        signature: 'ed25519:e0f49a88c7a13...',
        signatureVerified: true,
        createdAt: new Date().toISOString(),
        reviewer: { fullName: 'Sarah Chen (Ex-Stripe)', headline: 'Staff Infrastructure Architect' },
      },
    ],
  },
  {
    id: 'sub-2',
    title: 'Tactile 3D Particle Visualizer for High-Frequency Feeds',
    description: 'GPU-instanced WebGL visualizer rendering 250,000 real-time nodes with 60fps budget on mobile browsers.',
    proofUrl: 'https://wavesync.demo/tactile-particles',
    proofType: 'live',
    status: 'approved',
    createdAt: new Date().toISOString(),
    author: { id: 'u-b2', fullName: 'Aria Thorne', role: 'student' },
    reviews: [
      {
        id: 'rev-2',
        verdict: 'approved',
        feedback: 'Flawless framerate consistency and restraint. Shaders are impeccably optimized.',
        signature: 'ed25519:9bc12f7142a...',
        signatureVerified: true,
        createdAt: new Date().toISOString(),
        reviewer: { fullName: 'Marcus Vance', headline: 'Creative Technologist @ Studio K' },
      },
    ],
  },
];

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
    } catch {
      throw new Error('Connection refused. Ensure the backend server is running on port 5001.');
    }

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Login failed. Please check your credentials.');
      const err: any = new Error(msg);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return { token: data.token, user: data.user || data };
  },

  async register(
    fullName: string,
    email: string,
    password: string,
    role: string
  ): Promise<{ token: string; user: User }> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });
    } catch {
      throw new Error('Connection refused. Ensure the backend server is running on port 5001.');
    }

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Registration failed.');
      throw new Error(msg);
    }
    const data = await res.json();
    return { token: data.token, user: data.user || data };
  },

  // OTP Verification
  async sendOtp(email: string): Promise<{ message: string; devOtp?: string }> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
    } catch {
      throw new Error('Connection refused. Ensure the backend server is running on port 5001.');
    }

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to send verification code.');
      throw new Error(msg);
    }
    return res.json();
  },

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      });
    } catch {
      throw new Error('Connection refused. Ensure the backend server is running on port 5001.');
    }

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Invalid or expired verification code.');
      throw new Error(msg);
    }
    return res.json();
  },

  // Jobs: Valid backend route is /api/jobs/matches (for student) or /api/jobs/mine (for poster)
  async getJobs(): Promise<JobOpportunity[]> {
    const token = localStorage.getItem('wavesync_token');
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/jobs/matches`, {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch {
        // Fallback
      }
    }
    return FALLBACK_JOBS;
  },

  // Collabs: Valid backend route is /api/collab/active
  async getCollabs(): Promise<CollabProject[]> {
    const token = localStorage.getItem('wavesync_token');
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/collab/active`, {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch {
        // Fallback
      }
    }
    return FALLBACK_COLLABS;
  },

  // Submissions: Valid backend routes are /api/submissions/mine (student) or /api/submissions/pending (reviewer)
  async getSubmissions(): Promise<Submission[]> {
    const token = localStorage.getItem('wavesync_token');
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/submissions/mine`, {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch {
        // Fallback
      }
    }
    return FALLBACK_SUBMISSIONS;
  },

  async createSubmission(payload: {
    title: string;
    description: string;
    proofUrl: string;
    proofType: string;
    collabPostId?: string;
  }): Promise<Submission> {
    // Map client proofType values to backend enum: ["github", "live", "pdf", "other"]
    const validProofType =
      payload.proofType === 'live_demo'
        ? 'live'
        : payload.proofType === 'figma'
        ? 'other'
        : payload.proofType === 'document'
        ? 'pdf'
        : ['github', 'live', 'pdf', 'other'].includes(payload.proofType)
        ? payload.proofType
        : 'other';

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          ...payload,
          proofType: validProofType,
        }),
      });
    } catch {
      throw new Error('Connection refused. Ensure the backend server is running on port 5001.');
    }

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to submit proof of work.');
      throw new Error(msg);
    }
    const data = await res.json();
    return data.submission || data;
  },

  async createReview(payload: {
    submissionId: string;
    verdict: string;
    feedback: string;
  }): Promise<SubmissionReview> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('Connection refused. Ensure the backend server is running on port 5001.');
    }

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to submit review.');
      throw new Error(msg);
    }
    const data = await res.json();
    return data.review || data;
  },
};
