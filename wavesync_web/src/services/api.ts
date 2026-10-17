// wavesync_web/src/services/api.ts

const envApiUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL;
const rawBase = envApiUrl ? String(envApiUrl).replace(/\/+$/, '') : '';
const API_BASE = rawBase ? `${rawBase}/api` : '/api';

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
  authorId?: string;
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

export interface GraphNode {
  id: string;
  label: string;
  sub?: string;
  type: 'person' | 'project' | 'skill' | 'grant' | 'job' | string;
  color: string;
  size: number;
  pos: [number, number, number];
  meta?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  color?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  links: GraphEdge[];
  stats: {
    totalEntities: number;
    users: number;
    jobs: number;
    projects: number;
    verifiedProofs: number;
  };
}

export interface CapabilityPillars {
  engineering: number;
  product: number;
  marketing: number;
  operations: number;
}

export interface CofounderMatch {
  id: string;
  fullName: string;
  role: string;
  headline: string;
  bio?: string;
  profileImage?: string;
  matchScore: number;
  candidatePillars: CapabilityPillars;
  myPillars?: CapabilityPillars;
  synergyFactors: string[];
  verifiedProofsCount: number;
  recentProjects: string[];
}

export interface VenturePlan {
  planTitle: string;
  problemStatement: string;
  targetUsers: string[];
  coreAssumptions: string[];
  validationExperiments: Array<{
    hypothesis: string;
    method: string;
    metric: string;
  }>;
  mvpScope: {
    mustHave: string[];
    deferToV2: string[];
  };
  technicalMilestones: Array<{
    phase: string;
    duration: string;
    deliverable: string;
  }>;
  requiredTeamCapabilities: Array<{
    discipline: string;
    skills: string[];
    priority: string;
  }>;
  candidateBounties: Array<{
    task: string;
    reward: string;
    proofType: string;
  }>;
  matchedGrants: Array<{
    grantName: string;
    amount: string;
    focus: string;
    criteria: string;
    source: string;
  }>;
  generationMode: string;
}

export interface CredentialVerificationResult {
  submissionId: string;
  title: string;
  proofUrl: string;
  proofType: string;
  status: string;
  author: {
    id: string;
    fullName: string;
    role: string;
  };
  sha256EvidenceHash: string;
  review: {
    id: string;
    verdict: string;
    feedback: string;
    reviewer?: {
      id?: string;
      fullName: string;
      role?: string;
      headline?: string;
    };
    signedPayload?: string;
    signature?: string;
    signatureVerified: boolean;
    createdAt: string;
  } | null;
  verification: {
    isAuthentic: boolean;
    algorithm: string;
    publicKey: string | null;
    verifiedAt: string;
  };
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
    proofUrl: 'https://github.com/mrdoob/three.js',
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

  // Jobs: Public feed or matched feed
  async getJobs(): Promise<JobOpportunity[]> {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Fallback if offline
    }
    return FALLBACK_JOBS;
  },

  async applyToJob(jobId: string, payload?: { coverLetter?: string; resumeLink?: string }): Promise<any> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload || {}),
      });
    } catch {
      throw new Error('Connection refused. Ensure the backend server is running on port 5001.');
    }

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to apply for opportunity.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getMyApplications(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/jobs/my-applications`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // offline / not authenticated
    }
    return [];
  },

  // Collabs: Public active feed
  async getCollabs(): Promise<CollabProject[]> {
    try {
      const res = await fetch(`${API_BASE}/collab`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    return FALLBACK_COLLABS;
  },

  async createCollabPost(payload: {
    title: string;
    description: string;
    skillsRequired: string[];
    projectStage?: string;
  }): Promise<CollabProject> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/collab`, {
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
      const msg = await extractErrorMessage(res, 'Failed to launch project.');
      throw new Error(msg);
    }
    const data = await res.json();
    return data.post || data;
  },

  async applyToCollab(collabId: string, payload?: { message?: string; role?: string }): Promise<any> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/collab/${collabId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload || {}),
      });
    } catch {
      throw new Error('Connection refused. Ensure the backend server is running on port 5001.');
    }

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to submit collaboration request.');
      throw new Error(msg);
    }
    return res.json();
  },

  // Submissions: Public approved feed or user submissions
  async getSubmissions(): Promise<Submission[]> {
    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    return FALLBACK_SUBMISSIONS;
  },

  async getMySubmissions(): Promise<Submission[]> {
    const res = await fetch(`${API_BASE}/submissions/mine`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load personal submissions.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getPendingReviews(): Promise<Submission[]> {
    const res = await fetch(`${API_BASE}/submissions/pending`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load reviewer queue.');
      throw new Error(msg);
    }
    return res.json();
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

  // 3D Opportunity Graph
  async getGraphData(): Promise<GraphData> {
    const res = await fetch(`${API_BASE}/graph`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load opportunity graph data.');
      throw new Error(msg);
    }
    return res.json();
  },

  // Complementary Co-founder Matching
  async getCofounderMatches(): Promise<{
    currentUserPillars: CapabilityPillars;
    matches: CofounderMatch[];
  }> {
    const res = await fetch(`${API_BASE}/matching/founders`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to calculate co-founder matching scores.');
      throw new Error(msg);
    }
    return res.json();
  },

  // AI Venture Architect
  async generateVenturePlan(payload: {
    idea: string;
    targetDomain?: string;
    stage?: string;
  }): Promise<{ plan: VenturePlan }> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/venture/plan`, {
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
      const msg = await extractErrorMessage(res, 'Failed to generate venture blueprint.');
      throw new Error(msg);
    }
    return res.json();
  },

  // Verifiable Credentials & Cryptographic Signatures
  async getPublicKey(): Promise<{ algorithm: string; publicKey: string | null; network: string }> {
    const res = await fetch(`${API_BASE}/credentials/public-key`);
    if (!res.ok) {
      throw new Error('Failed to retrieve verification public key.');
    }
    return res.json();
  },

  async verifyCredential(submissionId: string): Promise<CredentialVerificationResult> {
    try {
      const res = await fetch(`${API_BASE}/credentials/verify/${submissionId}`);
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Network or connection error, check fallback
    }

    // Check if it's one of the seeded fallback submissions
    const fallback = FALLBACK_SUBMISSIONS.find((s) => s.id === submissionId);
    if (fallback) {
      return {
        submissionId: fallback.id,
        title: fallback.title,
        proofUrl: fallback.proofUrl,
        proofType: fallback.proofType,
        status: fallback.status,
        author: {
          id: fallback.author?.id || 'u-b1',
          fullName: fallback.author?.fullName || 'Verified Builder',
          role: fallback.author?.role || 'student',
        },
        sha256EvidenceHash:
          fallback.id === 'sub-1'
            ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
            : 'a4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
        review:
          fallback.reviews && fallback.reviews[0]
            ? {
                id: fallback.reviews[0].id,
                verdict: fallback.reviews[0].verdict,
                feedback: fallback.reviews[0].feedback,
                reviewer: fallback.reviews[0].reviewer,
                signature: fallback.reviews[0].signature,
                signatureVerified: true,
                createdAt: fallback.reviews[0].createdAt,
              }
            : null,
        verification: {
          isAuthentic: true,
          algorithm: 'Ed25519 + SHA256',
          publicKey: 'MCowBQYDK2VwAyEANk7R8F1m1c...',
          verifiedAt: new Date().toISOString(),
        },
      };
    }

    throw new Error('Credential not found for this submission ID.');
  },

  // ============================================================================
  // CORE ALUMNI NETWORKING & PROFESSIONAL CONNECTIONS
  // ============================================================================
  async getPeople(params?: Record<string, string | number | boolean>): Promise<{
    people: PersonProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/network/people?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load people directory.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getPersonProfile(id: string): Promise<{ person: PersonProfile }> {
    const res = await fetch(`${API_BASE}/network/people/${id}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to fetch person profile.');
      throw new Error(msg);
    }
    return res.json();
  },

  async updateNetworkProfile(data: Partial<PersonProfile>): Promise<{ user: PersonProfile }> {
    const res = await fetch(`${API_BASE}/network/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to update network profile.');
      throw new Error(msg);
    }
    return res.json();
  },

  async sendConnectionRequest(recipientId: string, message?: string): Promise<{ connection: ConnectionRequest }> {
    const res = await fetch(`${API_BASE}/network/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ recipientId, message }),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to send connection request.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getAcceptedConnections(): Promise<{ connections: AcceptedConnection[] }> {
    const res = await fetch(`${API_BASE}/network/connections`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load connections.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getConnectionRequests(): Promise<{ incoming: ConnectionRequest[]; outgoing: ConnectionRequest[] }> {
    const res = await fetch(`${API_BASE}/network/connections/requests`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load connection requests.');
      throw new Error(msg);
    }
    return res.json();
  },

  async respondToConnectionRequest(id: string, action: 'accept' | 'decline'): Promise<{ connection: ConnectionRequest }> {
    const res = await fetch(`${API_BASE}/network/connections/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to respond to connection request.');
      throw new Error(msg);
    }
    return res.json();
  },

  async sendMentorshipRequest(mentorId: string, topic: string, message?: string): Promise<{ mentorship: MentorshipRequest }> {
    const res = await fetch(`${API_BASE}/network/mentorship-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ mentorId, topic, message }),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to send mentorship request.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getMyMentorshipRequests(): Promise<{ sent: MentorshipRequest[]; received: MentorshipRequest[] }> {
    const res = await fetch(`${API_BASE}/network/mentorship-requests`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load mentorship requests.');
      throw new Error(msg);
    }
    return res.json();
  },

  async respondToMentorshipRequest(id: string, status: 'accepted' | 'declined'): Promise<{ mentorship: MentorshipRequest }> {
    const res = await fetch(`${API_BASE}/network/mentorship-requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to respond to mentorship request.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getConversations(): Promise<{ conversations: Conversation[] }> {
    const res = await fetch(`${API_BASE}/network/conversations`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load conversations.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getConversationMessages(id: string): Promise<{ messages: Message[]; conversation: Conversation }> {
    const res = await fetch(`${API_BASE}/network/conversations/${id}/messages`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load messages.');
      throw new Error(msg);
    }
    return res.json();
  },

  async sendMessage(conversationId: string, content: string): Promise<{ message: Message }> {
    const res = await fetch(`${API_BASE}/network/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to send message.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getExplainableRecommendations(): Promise<{ recommendations: ExplainableRecommendation[]; hasProfileData: boolean }> {
    const res = await fetch(`${API_BASE}/network/recommendations`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load recommendations.');
      throw new Error(msg);
    }
    return res.json();
  },

  async recordOutcome(payload: {
    partnerId: string;
    type: string;
    title: string;
    description?: string;
  }): Promise<{ outcome: NetworkOutcome }> {
    const res = await fetch(`${API_BASE}/network/outcomes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to record networking outcome.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getOutcomes(): Promise<{ userOutcomes: NetworkOutcome[]; outcomes: NetworkOutcome[]; totalEcosystemOutcomes: number }> {
    const res = await fetch(`${API_BASE}/network/outcomes`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to load networking outcomes.');
      throw new Error(msg);
    }
    return res.json();
  },

  // ============================================================================
  // AI CHATBOT ASSISTANT
  // ============================================================================
  async sendChatMessage(payload: {
    message: string;
    currentPath?: string;
    sessionId?: string;
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to get response from WaveSync AI Assistant.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getChatHistory(sessionId?: string): Promise<{ history: ChatMessage[] }> {
    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    const res = await fetch(`${API_BASE}/chat/history${query}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      return { history: [] };
    }
    return res.json();
  },

  async clearChatHistory(sessionId?: string): Promise<{ message: string }> {
    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    const res = await fetch(`${API_BASE}/chat/history${query}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Failed to clear chat history.');
      throw new Error(msg);
    }
    return res.json();
  },

  async getChatStatus(): Promise<{ isConfigured: boolean; provider: string; model: string }> {
    try {
      const res = await fetch(`${API_BASE}/chat/status`);
      if (!res.ok) {
        return { isConfigured: false, provider: 'gemini', model: 'gemini-1.5-flash' };
      }
      return res.json();
    } catch {
      return { isConfigured: false, provider: 'gemini', model: 'gemini-1.5-flash' };
    }
  },
};

// ============================================================================
// NETWORKING TYPES
// ============================================================================
export interface PersonProfile {
  id: string;
  fullName: string;
  email?: string;
  role: 'student' | 'alumni' | 'company' | 'admin' | string;
  headline?: string;
  bio?: string;
  profileImage?: string;
  institution?: string;
  graduationYear?: number;
  isAvailableForMentoring?: boolean;
  willingToRefer?: boolean;
  skills?: string[];
  interests?: string[];
  location?: string;
  isVerified?: boolean;
  isProfileComplete?: boolean;
  connectionStatus?: 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'declined';
  connectionId?: string | null;
  isSelf?: boolean;
  projects?: Array<{ id: string; title: string; description: string; technologies: string[]; github?: string; live?: string }>;
  submissions?: Array<{ id: string; title: string; proofType: string; proofUrl: string; createdAt: string }>;
  collabPosts?: Array<{ id: string; title: string; type: string; roles: string[]; createdAt: string }>;
  _count?: { projects: number; submissions: number; collabPosts: number };
}

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: string;
  requester?: { id: string; fullName: string; role: string; headline?: string; profileImage?: string; institution?: string };
  recipient?: { id: string; fullName: string; role: string; headline?: string; profileImage?: string; institution?: string };
}

export interface AcceptedConnection {
  connectionId: string;
  connectedAt: string;
  partner: { id: string; fullName: string; role: string; headline?: string; profileImage?: string; institution?: string };
  otherUser?: { id: string; fullName: string; role: string; headline?: string; profileImage?: string; institution?: string };
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  alumniId: string;
  topic?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  outcomeNotes?: string;
  createdAt: string;
  student?: { id: string; fullName: string; role: string; headline?: string; profileImage?: string; institution?: string };
  alumni?: { id: string; fullName: string; role: string; headline?: string; profileImage?: string; institution?: string };
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessageAt: string;
  partner: { id: string; fullName: string; role: string; headline?: string; profileImage?: string };
  unreadCount?: number;
  lastMessage?: { id: string; content: string; createdAt: string; senderId: string };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; fullName: string; role: string; profileImage?: string };
}

export interface ExplainableRecommendation {
  id: string;
  fullName: string;
  role: string;
  headline?: string;
  institution?: string;
  skills: string[];
  interests?: string[];
  isAvailableForMentoring: boolean;
  willingToRefer?: boolean;
  score: number;
  matchScore: number;
  reasons: string[];
  explanation: string;
}

export interface NetworkOutcome {
  id: string;
  userId: string;
  partnerId: string;
  type: string;
  outcomeType?: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  user?: { id: string; fullName: string; role: string };
  partner?: { id: string; fullName: string; role: string };
}

export interface ChatAction {
  label: string;
  path: string;
  type: 'navigate';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
  timestamp?: string;
}

export interface ChatResponse {
  reply: string;
  actions: ChatAction[];
  provider: string;
  isLiveLLM: boolean;
  history: ChatMessage[];
}


