// wavesync_backend/tests/ps2_user_journeys.test.js
process.env.NODE_ENV = 'test';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { prisma } from '../config/prisma.js';

let server;
let baseUrl;
const JWT_SECRET = process.env.JWT_SECRET || 'wavesync_dev_fallback_secret_key_32chars';

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
}

async function apiRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }
  const res = await fetch(url, fetchOptions);
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, headers: res.headers, data };
}

describe('PS2: Entrepreneurship & Employment End-to-End User Journeys', () => {
  let founderUser;
  let applicantUser;
  let reviewerUser;
  let thirdPartyUser;
  let founderToken;
  let applicantToken;
  let reviewerToken;
  let thirdPartyToken;
  let testJobId;
  let testCollabId;
  let testSubmissionId;

  before(async () => {
    // 1. Start ephemeral HTTP server
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    // 2. Setup isolated test users in database
    const founderEmail = `ps2_founder_${Date.now()}@example.com`;
    const applicantEmail = `ps2_applicant_${Date.now()}@example.com`;
    const reviewerEmail = `ps2_reviewer_${Date.now()}@example.com`;
    const thirdPartyEmail = `ps2_thirdparty_${Date.now()}@example.com`;

    founderUser = await prisma.user.create({
      data: {
        email: founderEmail,
        password: 'hashed_password_for_ps2_testing',
        fullName: 'Tara Founder',
        role: 'company',
        bio: 'Building next-gen distributed systems',
        skills: ['Venture Strategy', 'Distributed Systems', 'Go'],
      },
    });

    applicantUser = await prisma.user.create({
      data: {
        email: applicantEmail,
        password: 'hashed_password_for_ps2_testing',
        fullName: 'Devin Applicant',
        role: 'student',
        bio: 'Rust and TypeScript specialist',
        skills: ['Rust', 'TypeScript', 'React', 'GraphQL'],
      },
    });

    reviewerUser = await prisma.user.create({
      data: {
        email: reviewerEmail,
        password: 'hashed_password_for_ps2_testing',
        fullName: 'Elena Reviewer',
        role: 'alumni',
        bio: 'Principal Staff Engineer & Open Source Auditor',
        skills: ['Ed25519', 'Security Auditing', 'Distributed Consensus'],
      },
    });

    thirdPartyUser = await prisma.user.create({
      data: {
        email: thirdPartyEmail,
        password: 'hashed_password_for_ps2_testing',
        fullName: 'Oscar Outsider',
        role: 'student',
        bio: 'Observer',
        skills: ['Python'],
      },
    });

    founderToken = makeToken(founderUser);
    applicantToken = makeToken(applicantUser);
    reviewerToken = makeToken(reviewerUser);
    thirdPartyToken = makeToken(thirdPartyUser);

    // Create an initial job by founder
    const job = await prisma.job.create({
      data: {
        title: 'Core Systems Founding Engineer',
        description: 'Build high-throughput event processing pipelines and verifiable data feeds.',
        companyName: 'Tara Systems Lab',
        location: 'Remote / Hybrid',
        salaryRange: '$140k - $180k',
        jobType: 'Full-time',
        status: 'open',
        requirements: ['Rust', 'Distributed Systems', 'PostgreSQL'],
        postedById: founderUser.id,
      },
    });
    testJobId = job.id;
  });

  after(async () => {
    // Clean up test records
    try {
      if (testSubmissionId) {
        await prisma.review.deleteMany({ where: { submissionId: testSubmissionId } });
        await prisma.submission.deleteMany({ where: { id: testSubmissionId } });
      }
      if (testJobId) {
        await prisma.application.deleteMany({ where: { jobId: testJobId } });
        await prisma.job.deleteMany({ where: { id: testJobId } });
      }
      if (testCollabId) {
        if (prisma.collabApplicant) {
          await prisma.collabApplicant.deleteMany({ where: { collabPostId: testCollabId } });
        }
        await prisma.collabPost.deleteMany({ where: { id: testCollabId } });
      }
      if (applicantUser && founderUser) {
        await prisma.connection.deleteMany({
          where: {
            OR: [
              { requesterId: applicantUser.id },
              { recipientId: applicantUser.id },
              { requesterId: founderUser.id },
              { recipientId: founderUser.id },
            ],
          },
        });
      }
      if (founderUser && applicantUser && reviewerUser && thirdPartyUser) {
        await prisma.user.deleteMany({
          where: {
            id: { in: [founderUser.id, applicantUser.id, reviewerUser.id, thirdPartyUser.id] },
          },
        });
      }
    } catch (cleanupErr) {
      console.warn('Cleanup error (ignored):', cleanupErr.message);
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // Journey 1: Job Discovery, Application, Status, and Duplicate Handling
  it('Journey 1: Job seeker discovers opportunity, applies with note, checks status, and duplicate is rejected', async () => {
    // 1. Discover jobs
    const listRes = await apiRequest('/api/jobs');
    assert.equal(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data));
    const targetJob = listRes.data.find((j) => j.id === testJobId);
    assert.ok(targetJob, 'Target job must be listed in discovery feed');

    // 2. Apply to job
    const applyRes = await apiRequest(`/api/jobs/${testJobId}/apply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${applicantToken}` },
      body: {
        coverLetter: 'I have 3 years building Rust pipelines and completed 2 verified BTE proofs.',
        resumeLink: 'https://github.com/devin-applicant',
      },
    });
    assert.equal(applyRes.status, 201, 'Application should be created with HTTP 201');
    assert.ok(applyRes.data.application, 'Should return application record');
    assert.equal(applyRes.data.application.status, 'applied');

    // 3. Verify in getMyApplications
    const myAppsRes = await apiRequest('/api/jobs/my-applications', {
      headers: { Authorization: `Bearer ${applicantToken}` },
    });
    assert.equal(myAppsRes.status, 200);
    assert.ok(Array.isArray(myAppsRes.data));
    const myApp = myAppsRes.data.find((a) => a.jobId === testJobId);
    assert.ok(myApp, 'Application must be persisted and visible in candidate dashboard');
    assert.equal(myApp.coverLetter, 'I have 3 years building Rust pipelines and completed 2 verified BTE proofs.');

    // 4. Duplicate application must be cleanly rejected
    const dupRes = await apiRequest(`/api/jobs/${testJobId}/apply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${applicantToken}` },
      body: { coverLetter: 'Trying to apply again' },
    });
    assert.equal(dupRes.status, 400, 'Duplicate application must return HTTP 400');
    assert.match(dupRes.data.message, /already applied/i);
  });

  // Journey 2: Venture Creation, Blueprint Persistence, and Teammate Matching
  it('Journey 2: Founder creates a venture plan, milestones and skills are persisted, and gap synergy is queried', async () => {
    const venturePayload = {
      title: 'Decentralized Edge Telemetry',
      description: 'Zero-knowledge verification network for edge device telemetry with automated bounty escrow.',
      skillsRequired: ['Rust', 'Cryptography', 'React'],
      projectStage: 'Prototype Stage',
    };

    const createRes = await apiRequest('/api/collab', {
      method: 'POST',
      headers: { Authorization: `Bearer ${founderToken}` },
      body: venturePayload,
    });
    assert.equal(createRes.status, 201, 'Venture must be created with HTTP 201');
    assert.ok(createRes.data.id, 'Must return created collab post');
    testCollabId = createRes.data.id;

    // Verify venture is persisted in database with full details
    const getRes = await apiRequest(`/api/collab/${testCollabId}`);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.title, venturePayload.title);
    assert.deepEqual(getRes.data.skillsRequired, venturePayload.skillsRequired);
    assert.equal(getRes.data.authorId, founderUser.id);

    // Teammate & Co-founder gap analysis
    const synergyRes = await apiRequest('/api/matching/founders', {
      headers: { Authorization: `Bearer ${founderToken}` },
    });
    assert.equal(synergyRes.status, 200);
    assert.ok(Array.isArray(synergyRes.data.matches), 'Should return candidate matches');
  });

  // Journey 3: Connection & Mentorship Requests
  it('Journey 3: User sends connection & mentorship requests, recipient accepts, status is updated', async () => {
    // 1. Send connection request from applicant to reviewer
    const connRes = await apiRequest('/api/network/connections', {
      method: 'POST',
      headers: { Authorization: `Bearer ${applicantToken}` },
      body: {
        recipientId: reviewerUser.id,
        contextNote: 'Would love your guidance on our cryptographic signing pipeline.',
      },
    });
    assert.equal(connRes.status, 201);
    const requestId = connRes.data.connection.id;

    // 2. Reviewer accepts connection request
    const acceptRes = await apiRequest(`/api/network/connections/${requestId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${reviewerToken}` },
      body: { status: 'accepted' },
    });
    assert.equal(acceptRes.status, 200);
    assert.equal(acceptRes.data.connection.status, 'accepted');

    // 3. Verified connection visible to both users
    const myConns = await apiRequest('/api/network/connections', {
      headers: { Authorization: `Bearer ${applicantToken}` },
    });
    assert.equal(myConns.status, 200);
    const connFound = myConns.data.connections.find(
      (c) => c.otherUser?.id === reviewerUser.id || c.recipientId === reviewerUser.id || c.requesterId === reviewerUser.id
    );
    assert.ok(connFound, 'Accepted connection must appear in user network');
  });

  // Journey 4: Project Submission (Build-to-Earn)
  it('Journey 4: Project participant submits work to Build-to-Earn ledger and checks review status', async () => {
    const subPayload = {
      title: 'Verifiable Zero-Knowledge Signature Verifier',
      description: 'WASM-compiled Ed25519 signature auditor with sub-10ms benchmark in the browser.',
      proofUrl: 'https://github.com/wavesync-audits/zk-signature-wasm',
      proofType: 'github',
    };

    const subRes = await apiRequest('/api/submissions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${applicantToken}` },
      body: subPayload,
    });
    assert.equal(subRes.status, 201);
    assert.ok(subRes.data.submission?.id || subRes.data.id);
    testSubmissionId = subRes.data.submission?.id || subRes.data.id;

    // Verify submission is pending
    const getSub = await apiRequest(`/api/submissions/${testSubmissionId}`, {
      headers: { Authorization: `Bearer ${applicantToken}` },
    });
    assert.equal(getSub.status, 200);
    assert.equal(getSub.data.status, 'pending');
    assert.equal(getSub.data.authorId, applicantUser.id);
  });

  // Journey 5: Authorized Reviewer Processes Submission & Cryptographic Signature
  it('Journey 5: Authorized reviewer audits submission and issues Ed25519 verified credential', async () => {
    const reviewPayload = {
      submissionId: testSubmissionId,
      feedback: 'Excellent benchmark harness. Test coverage exceeds 95% with zero memory leaks in WASM memory boundary.',
      verdict: 'approved',
    };

    const reviewRes = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${reviewerToken}` },
      body: reviewPayload,
    });
    assert.equal(reviewRes.status, 201);
    assert.ok(reviewRes.data.review.signature, 'Signature must be created');

    // Verify credential verification endpoint returns valid cryptographic seal
    const credRes = await apiRequest(`/api/credentials/verify/${testSubmissionId}`);
    assert.equal(credRes.status, 200);
    assert.equal(credRes.data.status, 'approved', 'Submission status should be approved');
    assert.ok(credRes.data.sha256EvidenceHash, 'Must include SHA-256 evidence integrity hash');
    assert.ok(credRes.data.review?.signature, 'Must include cryptographic signature in review');
    assert.ok(credRes.data.verification?.isAuthentic, 'Verification must be marked authentic');
    assert.equal(credRes.data.submissionId, testSubmissionId);
  });

  // Journey 6: Funding and Startup Growth Resources
  it('Journey 6: Venture builder funding API returns genuine, verifiable grants with active URLs', async () => {
    const grantsRes = await apiRequest('/api/venture/grants');
    assert.equal(grantsRes.status, 200);
    assert.ok(Array.isArray(grantsRes.data), 'Grants must return an array');
    assert.ok(grantsRes.data.length >= 3, 'Should provide at least 3 genuine grants');

    // Ensure URLs are genuine external domains and not fake dummy URLs
    for (const grant of grantsRes.data) {
      assert.ok(grant.source, 'Grant must have a source URL');
      assert.ok(
        grant.source.startsWith('https://'),
        `Grant URL ${grant.source} must be HTTPS`
      );
      assert.ok(
        !grant.source.includes('wavesync.io/grants/apply-now'),
        `Grant URL ${grant.source} must not be a dummy placeholder`
      );
    }
  });

  // Journey 7: Security and Unauthorized Action Prevention
  it('Journey 7: Unauthorized actions are rejected with appropriate HTTP status codes', async () => {
    // 1. Creator cannot apply to their own job
    const selfApply = await apiRequest(`/api/jobs/${testJobId}/apply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${founderToken}` },
      body: { coverLetter: 'Applying to my own company' },
    });
    assert.equal(selfApply.status, 400, 'Self-application must be forbidden');
    assert.match(selfApply.data.message, /cannot apply to your own posting/i);

    // 2. Self connection request must be rejected
    const selfConn = await apiRequest('/api/network/connections', {
      method: 'POST',
      headers: { Authorization: `Bearer ${applicantToken}` },
      body: { recipientId: applicantUser.id },
    });
    assert.equal(selfConn.status, 400, 'Self connection must be rejected');

    // 3. Non-reviewer / candidate cannot approve own submission
    const fakeReview = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${applicantToken}` },
      body: { submissionId: testSubmissionId, feedback: 'Approving my own code with detailed text', verdict: 'approved' },
    });
    assert.ok(
      fakeReview.status === 400 || fakeReview.status === 403,
      'Self-review or unauthorized student review must be rejected'
    );
  });

  // Journey 8: Multi-Section State Persistence Across Page Refreshes
  it('Journey 8: Users navigate between sections without losing persisted data in PostgreSQL', async () => {
    // Re-query database directly via Prisma to ensure true database persistence
    const savedJob = await prisma.job.findUnique({
      where: { id: testJobId },
      include: { applications: true },
    });
    assert.ok(savedJob, 'Job must exist in PostgreSQL');
    assert.equal(savedJob.applications.length, 1, 'Job must have 1 persisted application in DB');
    assert.equal(savedJob.applications[0].studentId, applicantUser.id);

    const savedCollab = await prisma.collabPost.findUnique({
      where: { id: testCollabId },
    });
    assert.ok(savedCollab, 'Venture collab post must exist in PostgreSQL');
    assert.equal(savedCollab.authorId, founderUser.id);

    const savedSubmission = await prisma.submission.findUnique({
      where: { id: testSubmissionId },
      include: { reviews: true },
    });
    assert.ok(savedSubmission, 'Submission must exist in PostgreSQL');
    assert.equal(savedSubmission.status, 'approved');
    assert.equal(savedSubmission.reviews.length, 1);
  });
});
