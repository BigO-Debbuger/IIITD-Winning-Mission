# 🌊 WaveSync — Verifiable Entrepreneurship & Talent Platform

> **Problem Statement 2: Entrepreneurship & Employment**  
> *Connecting Talent, Ideas, and Opportunities through Verifiable Proof-of-Work and Ecosystem Intelligence.*

WaveSync is an institutional career, venture-building, and proof-of-work ecosystem engineered for undergraduate talent, startup founders, and verified alumni mentors. Built on PostgreSQL, Prisma ORM, Node.js/Express, React (Vite + TypeScript), and cryptographic Ed25519 digital signatures with SHA-256 evidence digests.

---

## 🏗️ System Architecture & Major Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (wavesync_web)                         │
│   React 18 + Vite + TypeScript + Three.js / React Three Fiber (R3F)    │
│  - 3D OpportunityGraph (Three.js canvas)                                │
│  - Opportunity Explorer & Application Slide-Over                       │
│  - AI Venture Architect (Milestones, Skills, Grant Navigator)          │
│  - Co-Founder Synergy & Gap Matcher                                    │
│  - Build-to-Earn Proof Submission & Credential Inspector               │
│  - Verified Alumni & Peer Directory                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (/api/*)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Backend (wavesync_backend)                        │
│             Node.js (v18+) + Express + Prisma ORM + Node Crypto         │
│  - Auth & OTP Lifecycle (Rate-limited, isolated in production)         │
│  - Venture Builder & Collaboration Post Engine                         │
│  - Deterministic Skill Synergy & Gap Matching Engine                   │
│  - Build-to-Earn Review Pipeline (Role-gated, anti-self-review)        │
│  - Cryptographic Engine: Ed25519 Digital Signatures + SHA-256 Digest   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL Connection Pool
┌───────────────────────────────────▼────────────────────────────────────┐
│                      Database (PostgreSQL 14+)                         │
│  - User, Job, Application (jobId_studentId unique compound key)         │
│  - CollabPost, CollabApplicant (collabPostId_studentId unique)          │
│  - Submission, SubmissionReview (submissionId_reviewerId unique)       │
│  - Connection, Mentorship, Conversation, Message, Project              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Prerequisites & Supported Environment

- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **Package Manager**: `npm` (v9+)
- **Database**: PostgreSQL `14+` running locally or on a managed cloud instance
- **Operating System**: Linux, macOS, or Windows 10/11 (PowerShell/Bash)

---

## ⚙️ Environment Configuration

### Backend (`wavesync_backend/.env`)

Copy `.env.example` to `.env`:

```bash
cp wavesync_backend/.env.example wavesync_backend/.env
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP listening port | `5001` |
| `NODE_ENV` | Environment mode (`development`, `test`, `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/wavesync?schema=public` |
| `JWT_SECRET` | Secret for signing session JWT tokens (min 32 chars) | `<secure_random_string>` |
| `WAVESYNC_SIGNING_PRIVATE_KEY` | Ed25519 private key in base64url DER format | `<generated_via_crypto>` |
| `WAVESYNC_SIGNING_PUBLIC_KEY` | Ed25519 public key in base64url SPKI format | `<generated_via_crypto>` |
| `EMAIL_HOST` | Nodemailer SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `<smtp_user_placeholder>` |
| `EMAIL_PASS` | SMTP application password | `<smtp_pass_placeholder>` |
| `GEMINI_API_KEY` | Optional Google Gemini API key for deep plan generation | `<optional_key>` |

> **Security Note**: Never commit `.env` or expose private keys to source control. In production (`NODE_ENV=production`), missing or fallback JWT secrets will cause a safe startup exit (`process.exit(1)`).

---

## 🗄️ Database Setup & Migrations

1. Ensure PostgreSQL is active on port `5432`:
   ```bash
   psql -U postgres -c "CREATE DATABASE wavesync;"
   ```

2. Generate the Prisma client and run migrations:
   ```bash
   cd wavesync_backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init_ps2_schema
   ```

3. Seed standard catalog & demo accounts:
   ```bash
   # Seeds general opportunity catalog
   node seed.js

   # Seeds labeled demo accounts for live presentation
   node seedDemo.js
   ```

---

## 🖥️ Running the Application

### Option A: Development Mode (Vite Dev Server + Express)

Open two terminal windows:

**Terminal 1 — Backend (Port 5001):**
```bash
cd wavesync_backend
npm start
# Server listens on http://localhost:5001
```

**Terminal 2 — Frontend (Port 5173):**
```bash
cd wavesync_web
npm install
npm run dev
# Frontend live on http://localhost:5173 (proxies /api to port 5001)
```

### Option B: Production Build Verification

```bash
cd wavesync_web
npm run build
# Compiles TypeScript and builds production assets to wavesync_web/dist
```

---

## 🧪 Automated Testing

Run the comprehensive 89-test Node.js test suite:

```bash
cd wavesync_backend
npm test
```

Test coverage includes:
- **`tests/e2e_api.test.js`**: PostgreSQL database workflows and route authentication guards.
- **`tests/auth_security.test.js`**: Role-based access control (RBAC), student vs alumni authorization, guest middleware.
- **`tests/bte_signatures.test.js`**: Ed25519 canonical payload construction, colon-delimiter injection prevention, digital signature generation, verification, and tamper detection.
- **`tests/bte_workflow.test.js`**: Live database submission creation, invalid input rejection, author self-review block (HTTP 403), alumni approval, status transitions, and duplicate review prevention (HTTP 409).
- **`tests/ps2_user_journeys.test.js`**: Complete 8-journey integration test covering job discovery, venture planning, talent matching, review cycles, and credential generation.
- **`tests/prisma_schema.test.js`**: UUID validation, compound unique constraints, and safe user sanitization.

---

## 👥 Demo Accounts (Pre-Seeded)

All demo accounts use password: `Password@123`

| Role | Email | Purpose in Live Demo |
| :--- | :--- | :--- |
| **Student Builder** | `student.demo@wavesync.io` | Discovers roles, applies with notes, plans ventures, submits proof of work |
| **Alumni Reviewer** | `alumni.demo@wavesync.io` | Accesses reviewer queue, audits submissions, issues Ed25519 digital credentials |
| **Founder / Venture** | `founder.demo@wavesync.io` | Posts collaboration roles, searches technical co-founders, recruits teammates |

---

## 🔐 Cryptographic Proof-of-Work Pipeline

WaveSync incorporates a tamper-evident review ledger for student deliverables:

1. **Evidence Digest (SHA-256)**:  
   When a student submits a deliverable (e.g., GitHub repository, research report), the system generates a cryptographic SHA-256 hash of the submission's evidence metadata:
   $$\text{EvidenceHash} = \text{SHA256}(\text{proofUrl} \mathbin{\Vert} \text{title} \mathbin{\Vert} \text{description})$$

2. **Canonical Payload Construction**:  
   When an authorized reviewer completes an audit, the backend constructs a strict canonical string:
   $$\text{CanonicalPayload} = \langle \text{submissionId} \rangle : \langle \text{reviewerId} \rangle : \langle \text{verdict} \rangle : \langle \text{iso8601Timestamp} \rangle$$
   *Colon injection is strictly prevented: all fields containing colons are rejected.*

3. **Ed25519 Digital Signing**:  
   The canonical payload is signed using the server's private Ed25519 key (`Node.js crypto.sign`). The resulting base64url signature is saved with the review record.

4. **Public Verification**:  
   Anyone can verify the authenticity of an issued credential via `GET /api/credentials/verify/:submissionId` or by retrieving the public key via `GET /api/credentials/public-key`. Altering any character in the payload or evidence fails verification immediately.

> **Limitation & Disclosure**: The SHA-256 digest hashes the submitted evidence URL and metadata. It verifies that the reviewed metadata has not changed since review; it does not crawl or freeze external Git commit trees unless integrated with an on-chain or IPFS snapshot provider.

---

## 🔍 Verified Hackathon Scope & Current Disclaimers

- **Problem Statement 2 Exclusivity**: Scoped exclusively to Entrepreneurship & Employment. Existing legacy networking features are preserved for backwards compatibility but not expanded.
- **External Grants & Funding**: Foundation grants listed in the Venture Architect (e.g., Ethereum Foundation ESP, Protocol Labs DevGrants, Gitcoin) are independent third-party programs. WaveSync does not guarantee eligibility, review times, or funding awards.
- **Co-Founder Matching**: Uses deterministic, explainable skill-overlap and gap analysis algorithms. It does not claim unverified black-box neural matching.
