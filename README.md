# WaveSync — Verifiable Entrepreneurship, Career & Talent Protocol

> **Institutional Ecosystem for Entrepreneurship, Mentorship & Verifiable Employment**  
> *Connecting Talent, Ventures, and Capital through Cryptographically Audited Proof-of-Work and Real-Time Ecosystem Intelligence.*

WaveSync is an institutional platform designed to eliminate static alumni directories, resume inflation, and opaque hiring pipelines. Built on PostgreSQL, Prisma ORM, Node.js/Express, React 18 (Vite + TypeScript), React Three Fiber, and cryptographic Ed25519 digital signatures with SHA-256 evidence digests, WaveSync bridges undergraduate talent, startup founders, verified alumni mentors, faculty advisors, corporate recruiters, and university leadership into a unified high-trust network.

![WaveSync Platform Hero - Where Founders Meet Builders & Proof Speaks](./images/hero_section.jpeg)

---

## Table of Contents

- [Core Value Proposition](#core-value-proposition)
- [System Architecture](#system-architecture)
- [The 6-Stakeholder Ecosystem Network](#the-6-stakeholder-ecosystem-network)
- [Interactive 3D Opportunity Graph](#interactive-3d-opportunity-graph)
- [Build-to-Earn Cryptographic Proof Protocol](#build-to-earn-cryptographic-proof-protocol)
- [Venture Architect & Complementary Matching](#venture-architect--complementary-matching)
- [Opportunities & Grants Pipeline](#opportunities--grants-pipeline)
- [End-to-End Operational Workflows](#end-to-end-operational-workflows)
- [Monorepo Directory Layout](#monorepo-directory-layout)
- [Database Schema & Entity Models](#database-schema--entity-models)
- [Security & Anti-Tampering Engine](#security--anti-tampering-engine)
- [Setup & Installation Guide](#setup--installation-guide)
- [Pre-Seeded Demo Accounts](#pre-seeded-demo-accounts)
- [Automated Testing & Verification](#automated-testing--verification)
- [REST API Reference Ledger](#rest-api-reference-ledger)
- [Platform Integrity & Deployment Telemetry](#platform-integrity--deployment-telemetry)

---

## Core Value Proposition

Traditional university placement and alumni systems suffer from three fundamental failures:
1. **Unverified Claims & Resume Inflation**: Anyone can list advanced skills or frameworks; recruiters receive hundreds of unverified claims with zero cryptographic audit trail.
2. **Disconnected Alumni Networks**: Alumni directories are passive address books without direct mechanisms to review student deliverables, mentor in context, or scout early-stage venture co-founders.
3. **Fragmented Venture Formation**: Student entrepreneurs lack structured milestones, co-founder synergy matching based on complementary skill gaps, and access to non-dilutive foundation grants.

WaveSync resolves these bottlenecks by transforming career development into an audited, proof-driven pipeline:
- **Where Founders Meet Builders & Proof Speaks**: Direct equity roles, founding engineering roles, and funded bounties.
- **Audited Deliverables**: Every engineering submission is hashed with SHA-256 and sealed with Ed25519 digital signatures by verified alumni reviewers.
- **Deterministic Co-Founder Matching**: Evaluates four core capability pillars (Engineering, Product, Marketing, Operations) to match complementary teams.
- **Dynamic 3D Ecosystem Visualization**: Interactive force-directed spatial map linking founders, projects, collaborators, and grants.

---

## System Architecture

WaveSync is built as a modular monorepo containing a high-performance web application, an enterprise backend service, a mobile client, and a unified PostgreSQL database.

```
+-------------------------------------------------------------------------+
|                       Web Frontend (wavesync_web)                       |
|          React 18 + TypeScript + Vite + React Three Fiber / Drei        |
|  - Real-Time 3D Opportunity Graph (WebGL Canvas)                        |
|  - Neo-Tactile Warm Paper Design Tokens (#FFF7EC, #05020B, Accent Lime) |
|  - Opportunities Ledger & Application Slide-Over                        |
|  - Venture Blueprint & Co-Founder Matching Modal                        |
|  - Build-to-Earn Proof Ledger & Cryptographic Credential Inspector      |
|  - Responsive Modal Primitive (createPortal, scroll-lock, Esc-dismiss)  |
+------------------------------------+------------------------------------+
                                     | HTTP / REST (/api/*)
+------------------------------------v------------------------------------+
|                      Backend (wavesync_backend)                         |
|             Node.js (v18+) + Express + Prisma ORM + Node Crypto         |
|  - Cryptographic Engine: Ed25519 Digital Signing + SHA-256 Evidence     |
|  - Canonical Payload Serialization (Strict colon-delimiter defense)     |
|  - Role-Based Access Control (student, alumni, company, admin)          |
|  - Deterministic 4-Pillar Synergy & Gap Matching Engine                 |
|  - Build-to-Earn Auditing Pipeline (Anti-self-review guards)            |
|  - Auth & OTP Lifecycle (Rate-limited, bcrypt password hashing)         |
+------------------------------------+------------------------------------+
                                     | SQL Connection Pool
+------------------------------------v------------------------------------+
|                      Database (PostgreSQL 14+)                          |
|  - Identity: User, Profile Metadata (studentDetails, alumniDetails)     |
|  - Jobs: Job, Application (jobId_studentId compound unique key)         |
|  - Ventures: CollabPost, CollabApplicant (collabPostId_studentId)       |
|  - Verification: Submission, SubmissionReview (submissionId_reviewerId) |
|  - Networking: Connection, Mentorship, Conversation, Message, Project   |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------v------------------------------------+
|                      Mobile App (wavesync_fixed)                        |
|                  Expo (v54) + React Native 19 + Expo Router             |
|  - Role-based tabs: Student, Alumni, Company                            |
|  - Mobile Proof Submission & Review Queue Handlers                      |
+-------------------------------------------------------------------------+
```

---

## The 6-Stakeholder Ecosystem Network

![WaveSync 6-Stakeholder Unified Network](./images/stakeholders_matrix.jpeg)

WaveSync establishes a closed-loop institutional lifecycle across six distinct user segments:

| Stakeholder | Focus Domain | Core Pathways & System Capabilities | Action in Platform |
| :--- | :--- | :--- | :--- |
| **Students & Builders** | Craft & Acceleration | 1:1 Alumni Mentorship, Real Collab Ventures, Ed25519 Signed Proofs, Direct Hiring Offers | Explore Open Roles |
| **Alumni & Mentors** | Evaluation & Guidance | Mentorship Sessions, Code Auditing Queue, Signature Sealing, Venture Dealflow | Access Review Queue |
| **Faculty & Advisors** | Academic Guidance | Capstone Alignment, Grant Recommendations, Research Collabs, Cohort Tracking | Inspect Grants |
| **Founders & Startups** | Venture Formation | Venture Blueprint, Complementary Gap Search, Team Assembly, Milestone Bounties | Find Co-Founders |
| **Recruiters & Companies** | Verified Hiring | Bounty Publishing, Artifact Inspection, Cryptographic Proof Check, Direct Pipeline | Post an Opportunity |
| **Institutions & Admins** | Outcome Intelligence | Engagement Telemetry, Mentorship Hours Log, Placement Tracking, Accreditation Reports | System Architecture |

---

## Interactive 3D Opportunity Graph

![WaveSync Real-Time 3D Opportunity Graph](./images/opportunity_graph_3d.jpeg)

The frontend includes an interactive WebGL 3D force-directed opportunity graph rendered using Three.js, React Three Fiber (`@react-three/fiber`), and `@react-three/drei`.

### Key Graph Features
- **Categorical Node Clustering**: Node color coding for Founders (warm coral), Projects (cyan), Collaborators (electric lime), and Grants (lavender).
- **Spatial Kinematics**: Damped spring simulation with spherical boundary constraints and orbit controls (rotate, zoom, pan).
- **Selective Node Inspection**: Clicking on any node exposes detailed metadata, funding allocation, active collaborators, and a slide-over trigger for direct role application.
- **Dynamic Filtering**: Interactive filter bar to toggle visibility across All Ecosystem (8+), Founders, Projects, Collaborators, and Grants.

---

## Build-to-Earn Cryptographic Proof Protocol

![WaveSync Build-to-Earn Cryptographic Proof Ledger](./images/build_to_earn_ledger.jpeg)

The Build-to-Earn (BTE) ledger solves the verification bottleneck by replacing self-reported bullet points with cryptographically signed, peer-reviewed engineering artifacts.

```
[Student Submission]
        │
        ▼ (proofUrl + title + description)
   SHA-256 Evidence Digest Computed
        │
        ▼
   Pending Review in Alumni Queue
        │
        ▼
[Alumni Audit Verdict] (APPROVE / REJECT + score + evaluation notes)
        │
        ▼
   Canonical Payload Serialization:
   <submissionId>:<reviewerId>:<verdict>:<iso8601Timestamp>
        │
        ▼
   Ed25519 Digital Signature Generation (Private Key)
        │
        ▼
[Immutable SubmissionReview Record Saved to PostgreSQL]
        │
        ▼
Public Verification Endpoint (GET /api/credentials/verify/:id)
```

### Mathematical & Cryptographic Specifications

1. **Evidence Digest (SHA-256)**:
   ```
   EvidenceDigest = SHA256( proofUrl || title || description )
   ```
   Ensures the submitted code repository, deployment, or design artifact cannot be swapped out retroactively.

2. **Canonical Payload Serialization**:
   ```
   CanonicalPayload = submissionId + ":" + reviewerId + ":" + verdict + ":" + timestampISO
   ```
   *Delimiter Injection Defense*: The serialization engine strictly validates all inputs; any field containing an unescaped colon (`:`) is rejected to prevent payload forgery.

3. **Digital Signature (Ed25519)**:
   The backend signs the canonical payload using Node.js native crypto with an Ed25519 private key in base64url DER format:
   ```
   Signature = Ed25519_Sign( PrivateKey, UTF8(CanonicalPayload) )
   ```

4. **Public Verification**:
   Anyone can verify the validity of an issued credential using the public SPKI key:
   ```
   IsValid = Ed25519_Verify( PublicKey, UTF8(CanonicalPayload), Signature )
   ```

---

## Venture Architect & Complementary Matching

### Deterministic 4-Pillar Gap Analysis
Unlike opaque heuristic matchers, WaveSync uses a deterministic 4-pillar capability matrix:
- **Engineering**: Systems programming, backend architecture, frontend, distributed ledgers.
- **Product**: UI/UX design, user research, product strategy, telemetry.
- **Marketing**: Growth loops, community building, developer relations, brand.
- **Operations**: Financial modeling, legal/compliance, grant writing, hiring.

When a founder posts a venture, the engine computes team gap scores against candidate profiles:
$$\text{SynergyScore} = w_e \cdot \Delta_{\text{eng}} + w_p \cdot \Delta_{\text{prod}} + w_m \cdot \Delta_{\text{mkt}} + w_o \cdot \Delta_{\text{ops}}$$

Candidates with complementary capabilities (filling empty or weak quadrants) receive prioritized matching recommendations.

### Venture Roadmap Decomposition
The Venture Architect breaks high-level ideas into three execution stages:
1. **Proof of Concept (PoC)**: Core technology validation, prototype benchmarking, and GitHub proof artifact.
2. **Alpha Deployment**: Multi-user staging environment, test coverage above 90%, and security audit.
3. **Ecosystem & Grant Application**: Milestone deliverables tailored to public grants (e.g., Ethereum Foundation ESP, Protocol Labs DevGrants, Gitcoin, IIITD Innovation Fund).

---

## Opportunities & Grants Pipeline

![WaveSync Current Opportunities Directory & Grants](./images/opportunities_directory.jpeg)

The opportunities directory consolidates three income and career pathways:

1. **Founding Engineer & Full-Time Roles**: Direct equity and cash packages at alumni-founded ventures (e.g., Tara Systems Lab, WaveMesh Core).
2. **Funded Bounties**: Discrete deliverables with fixed rewards and mandatory Build-to-Earn review requirements.
3. **Ecosystem Grants**: Non-dilutive academic and protocol grants vetted by faculty advisors.

### Search, Categorization & Application
- Real-time search by role title, technical skill, or hiring company.
- Fast category filters: `All Opportunities`, `Founding Roles`, `Bounties & Grants`, `My Applications`.
- Slide-over application drawer allowing candidates to attach existing Ed25519-verified proofs of work directly to their submission.

---

## End-to-End Operational Workflows

### 1. Student Builder Workflow
```
Register Account (Role: student)
       │
       ▼
Browse Opportunities / 3D Graph / Venture Blueprints
       │
       ▼
Submit Project Proof to Build-to-Earn Ledger (Evidence URL + metadata)
       │
       ▼
Wait for Alumni Code Audit in Queue
       │
       ▼
Receive Approved Status + Ed25519 Digital Credential
       │
       ▼
Attach Verified Credential to Job Application / Co-Founder Application
```

### 2. Alumni Reviewer Workflow
```
Login with Verified Alumni Account (Role: alumni)
       │
       ▼
Open Reviewer Queue (`/api/submissions/pending`)
       │
       ▼
Inspect Candidate Evidence (Code repo, benchmark logs, architecture)
       │
       ▼
Enforce Security Guard: Anti-Self-Review Check (authorId != reviewerId)
       │
       ▼
Submit Audit Verdict (Score 1-100, Notes, APPROVE / REJECT)
       │
       ▼
Backend Generates Ed25519 Signature & Updates Submission Status
```

### 3. Founder Collaboration Workflow
```
Publish Collab Venture Post (Required roles, skills, milestones)
       │
       ▼
Run Co-Founder Synergy Search
       │
       ▼
Inspect Applicant Profiles & Verified Proof Artifacts
       │
       ▼
Accept Team Members into Venture Roadmap
       │
       ▼
Assign Milestone Bounties Linked to Build-to-Earn Verification
```

---

## Monorepo Directory Layout

```
Referloom-career-platform-main/
├── README.md                      # Primary documentation & architecture guide
├── PROJECT_STATUS.md              # Milestone status & ledger
│
├── wavesync_web/                  # React 18 + TypeScript + Vite Web Application
│   ├── index.html                 # Single page application entry point
│   ├── vite.config.ts             # Vite build configuration (API proxying to port 5001)
│   ├── package.json               # Frontend dependencies (Three.js, Lucide, Tailwind/CSS)
│   └── src/
│       ├── main.tsx               # React root renderer
│       ├── App.tsx                # Application shell with navigation & active modals
│       ├── index.css              # Neo-tactile design tokens & responsive utilities
│       ├── context/
│       │   └── AuthContext.tsx    # Session management, token persistence, role state
│       ├── services/
│       │   └── api.ts             # Typed REST client for all backend endpoints
│       ├── components/
│       │   ├── Navbar.tsx                 # Fixed editorial navigation with role status
│       │   ├── Modal.tsx                  # Accessible React Portal modal primitive
│       │   ├── OpportunityGraph3D.tsx     # Three.js / R3F dynamic force graph
│       │   ├── ProblemSection.tsx         # The 3 core institutional failure modes
│       │   ├── EcosystemSection.tsx       # 6-stakeholder interactive pathway cards
│       │   ├── OpportunitySlideOver.tsx   # Detailed job drawer & application modal
│       │   ├── VentureSlideOver.tsx       # Venture detail drawer & team formation
│       │   ├── SubmitWorkModal.tsx        # Proof submission form with URL validation
│       │   ├── ReviewQueueModal.tsx       # Alumni audit workspace with signature signing
│       │   ├── CredentialModal.tsx        # Cryptographic credential & signature viewer
│       │   ├── CofounderMatchingModal.tsx # 4-pillar complementary gap calculator
│       │   ├── VentureArchitectModal.tsx  # Step-by-step milestone planner
│       │   └── Reveal.tsx                 # Scroll-triggered entrance animations
│       └── pages/
│           └── LandingPage.tsx    # Primary unified dashboard & catalog
│
├── wavesync_backend/              # Node.js + Express + Prisma Backend Service
│   ├── server.js                  # Express bootstrap, CORS, middleware, route mounting
│   ├── package.json               # Backend dependencies & test scripts
│   ├── seed.js                    # Core opportunity catalog seeder
│   ├── seedDemo.js                # Demo users and pre-approved cryptographic proofs
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL relational schema
│   │   └── migrations/            # Production migration history
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile updates, JWT issuance
│   │   ├── jobController.js       # Job listing, creation, and application management
│   │   ├── collabController.js    # Venture collab posts and team applications
│   │   ├── matchingController.js  # Complementary skill overlap engine
│   │   ├── ventureController.js   # Venture roadmap planning & grant directories
│   │   ├── submissionController.js# BTE submission ingest & student listings
│   │   └── reviewController.js    # Ed25519 signing, verification & queue queries
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT extraction and role validation
│   │   └── roleMiddleware.js      # Strict RBAC permission enforcement
│   ├── utils/
│   │   ├── signatureUtils.js      # Canonical payload & Ed25519 crypto routines
│   │   └── validators.js          # URL scheme and delimiter validation
│   └── tests/                     # Automated test suites
│       ├── e2e_api.test.js        # Full API integration suite
│       ├── auth_security.test.js  # RBAC & token validation tests
│       ├── bte_signatures.test.js # Canonical payload & signature unit tests
│       ├── bte_workflow.test.js   # Review cycle & live DB tests
│       └── ps2_user_journeys.test.js # 8 end-to-end user journeys
│
└── wavesync_fixed/                # React Native / Expo Mobile Application
    ├── app/                       # Expo Router role-based file tree
    │   ├── (roles)/alumni/        # Alumni mobile screens (Reviews, Mentorship)
    │   ├── (roles)/company/       # Company mobile screens (Applicants, Shortlists)
    │   └── (roles)/student/       # Student mobile screens (Proofs, Chat, Explore)
    └── package.json               # Expo v54 & React Native dependencies
```

---

## Database Schema & Entity Models

The PostgreSQL relational database is managed via Prisma ORM:

```
+--------------------+        +-------------------------+        +----------------------+
|       User         | 1    * |       Submission        | 1    * |   SubmissionReview   |
|--------------------|<-------|-------------------------|<-------|----------------------|
| id (UUID)          |        | id (UUID)               |        | id (UUID)            |
| email (Unique)     |        | authorId (FK -> User)   |        | submissionId (FK)    |
| password (bcrypt)  |        | title                   |        | reviewerId (FK)      |
| role (enum)        |        | description             |        | verdict              |
| fullName           |        | proofUrl                |        | score (1-100)        |
| studentDetails     |        | evidenceHash (SHA-256)  |        | feedback             |
| alumniDetails      |        | status (enum)           |        | signature (Ed25519)  |
+--------------------+        +-------------------------+        +----------------------+
     | 1                          | 1                                 |
     | *                          | *                                 |
+--------------------+        +-------------------------+             |
|        Job         | 1    * |       Application       |             |
|--------------------|<-------|-------------------------|             |
| id (UUID)          |        | id (UUID)               |             |
| postedById (FK)    |        | jobId (FK -> Job)       |             |
| title              |        | studentId (FK -> User)  |             |
| roleType           |        | status (pending, etc.)  |             |
| salary             |        | note                    |             |
+--------------------+        +-------------------------+             |
     | 1                                                              |
     | *                                                              |
+--------------------+        +-------------------------+             |
|     CollabPost     | 1    * |     CollabApplicant     |             |
|--------------------|<-------|-------------------------|             |
| id (UUID)          |        | id (UUID)               |             |
| authorId (FK)      |        | collabPostId (FK)       |             |
| title              |        | studentId (FK -> User)  |             |
| stage              |        | role                    |             |
| skillsNeeded       |        | status                  |             |
+--------------------+        +-------------------------+             |
```

### Relational Constraints
- `Application`: Unique composite index on `@@unique([jobId, studentId])` preventing duplicate applications.
- `CollabApplicant`: Unique composite index on `@@unique([collabPostId, studentId])`.
- `SubmissionReview`: Unique composite index on `@@unique([submissionId, reviewerId])` preventing reviewer double-voting.

---

## Security & Anti-Tampering Engine

1. **Anti-Self-Review Guard**: A user cannot review their own submission. The backend strictly verifies:
   ```javascript
   if (submission.authorId === reviewer.id) {
     return res.status(403).json({ error: "Self-review is strictly forbidden." });
   }
   ```
2. **Reviewer Role Enforcement**: Only accounts with verified `alumni` or `admin` roles can post reviews to `/api/reviews`.
3. **Double-Review Lock**: If a reviewer has already reviewed a submission, subsequent attempts return HTTP `409 Conflict`.
4. **State Transition Lock**: Submissions in terminal states (`approved` or `rejected`) cannot receive additional reviews.
5. **URL Scheme Whitelist**: Proof links must use secure `http://` or `https://` protocols; local file paths or dangerous schemes (`javascript:`, `data:`) are rejected.
6. **JWT Secrets Guard**: In production (`NODE_ENV=production`), missing JWT secret or Ed25519 keys triggers immediate process termination (`process.exit(1)`).

---

## Setup & Installation Guide

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` LTS
- **Package Manager**: `npm` (v9+)
- **Database**: PostgreSQL 14+ (Local or Hosted)

### 1. Clone & Configure Backend

```bash
git clone https://github.com/BigO-Debbuger/IIITD-Winning-Mission.git
cd IIITD-Winning-Mission/wavesync_backend

# Copy environment configuration
cp .env.example .env
```

Edit `wavesync_backend/.env` with your PostgreSQL credentials:

```ini
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wavesync?schema=public
JWT_SECRET=super_secure_random_key_with_at_least_32_characters
WAVESYNC_SIGNING_PRIVATE_KEY=<base64url_der_private_key>
WAVESYNC_SIGNING_PUBLIC_KEY=<base64url_spki_public_key>
```

### 2. Database Migrations & Seeding

```bash
cd wavesync_backend

# Install dependencies
npm install

# Run database migrations
npx prisma generate
npx prisma migrate dev --name init_platform_schema

# Seed opportunity catalog and demo credentials
node seed.js
node seedDemo.js
```

### 3. Launch the Backend Server

```bash
cd wavesync_backend
npm start
# Server listens on http://localhost:5001
```

### 4. Launch the Web Frontend

In a second terminal:

```bash
cd wavesync_web
npm install
npm run dev
# Vite dev server live on http://localhost:5173
```

### 5. Production Web Build Verification

```bash
cd wavesync_web
npm run build
# Compiles TypeScript and creates optimized bundle in wavesync_web/dist
```

---

## Pre-Seeded Demo Accounts

All pre-seeded presentation accounts use password: `Password@123`

| Role | Email Address | Dashboard Capabilities |
| :--- | :--- | :--- |
| **Student Builder** | `student.demo@wavesync.io` | Discovers opportunities, applies with notes, plans roadmaps, submits BTE proofs |
| **Alumni Reviewer** | `alumni.demo@wavesync.io` | Accesses reviewer queue, audits submissions, issues Ed25519 cryptographic credentials |
| **Founder / Venture** | `founder.demo@wavesync.io` | Publishes collab projects, searches complementary co-founders, hires engineers |
| **Elena Rostova** | `elena.reviewer@wavesync.io` | Senior alumni auditor with pre-signed WASM cryptographic benchmark records |

---

## Automated Testing & Verification

The backend includes a comprehensive 89-test verification suite covering unit routines, cryptographic algorithms, RBAC rules, and full integration journeys.

```bash
cd wavesync_backend
npm test
```

### Test Suite Coverage Breakdown

- **`tests/bte_signatures.test.js`**:
  - Deterministic canonical payload generation.
  - Colon-delimiter injection prevention.
  - Ed25519 signing and verification.
  - Detection and rejection of tampered signature payloads.
  - Invalid signature byte handling.

- **`tests/bte_workflow.test.js`**:
  - URL scheme and payload validation.
  - Self-review authorization blocks (HTTP 403).
  - Non-alumni reviewer rejection (HTTP 403).
  - Valid review issuance with Ed25519 signature sealing.
  - Duplicate review prevention (HTTP 409).
  - Status transition locking.

- **`tests/security_auth.test.js`**:
  - Role-based middleware guards (`student`, `alumni`, `company`, `admin`).
  - Unauthenticated request interception.

- **`tests/ps2_user_journeys.test.js`**:
  - Complete 8-step end-to-end integration lifecycle from student registration to verified credential issuance.

---

## REST API Reference Ledger

### Authentication & Profiles
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account with role tag |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue session JWT |
| `GET` | `/api/users/profile` | Bearer Token | Retrieve authenticated user profile |
| `PUT` | `/api/users/profile` | Bearer Token | Update skills, interests, and role metadata |

### Opportunities & Applications
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | List all active jobs, bounties, and grants |
| `POST` | `/api/jobs` | Company / Alumni | Create a new job or bounty posting |
| `POST` | `/api/jobs/:id/apply` | Student | Apply to an opportunity with custom note |
| `GET` | `/api/jobs/my-applications`| Student | Retrieve user application status ledger |

### Build-to-Earn Proof Ledger
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/submissions` | Public | List public verified submissions |
| `POST` | `/api/submissions` | Student | Submit new engineering proof artifact |
| `GET` | `/api/submissions/my` | Student | Retrieve own submission history |
| `GET` | `/api/submissions/pending` | Alumni / Admin | Fetch unreviewed submissions queue |
| `POST` | `/api/reviews` | Alumni / Admin | Audit submission and issue Ed25519 signature |
| `GET` | `/api/credentials/verify/:id`| Public | Verify cryptographic integrity of review |
| `GET` | `/api/credentials/public-key`| Public | Retrieve server Ed25519 SPKI public key |

### Ventures & Co-Founder Matching
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/collabs` | Public | List all active venture collaboration posts |
| `POST` | `/api/collabs` | Founder / Student | Publish a new venture collab post |
| `POST` | `/api/collabs/:id/apply` | Student | Apply for a specific venture team role |
| `POST` | `/api/matching/cofounders`| Authenticated | Compute 4-pillar complementary gap match |
| `GET` | `/api/graph/data` | Public | Fetch 3D opportunity graph node & link topology |

---

## Platform Integrity & Deployment Telemetry

![WaveSync Platform Verification & System Status](./images/platform_footer.jpeg)

The platform features continuous real-time telemetry across PostgreSQL, Express API clusters, and React Three Fiber graphics pipelines, maintaining cryptographic auditability, health monitoring, and tamper resistance at every institutional layer.

---

## License & Institutional Context

WaveSync was engineered for the **IIITD Winning Mission** initiative under **Problem Statement 2: Entrepreneurship & Employment**. All cryptographic signing routines and architecture specifications adhere to reproducible open-source software practices.
..
