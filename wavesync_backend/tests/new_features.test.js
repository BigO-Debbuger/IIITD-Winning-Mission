import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../server.js';

let server;
let baseUrl;

async function apiRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, fetchOptions);
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

describe('WaveSync Extended Product Endpoints', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET /api/graph returns graph nodes and edges structure', async () => {
    const res = await apiRequest('/api/graph');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.nodes), 'nodes should be an array');
    assert.ok(Array.isArray(res.data.edges), 'edges should be an array');
    assert.ok(Array.isArray(res.data.links), 'links should be an array');
    assert.ok(res.data.stats, 'stats object should exist');
    assert.ok(typeof res.data.stats.totalNodes === 'number');
  });

  it('GET /api/matching/founders returns cofounder matches with explainable scores', async () => {
    const res = await apiRequest('/api/matching/founders');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.matches), 'matches should be an array');
    if (res.data.matches.length > 0) {
      const match = res.data.matches[0];
      assert.ok(match.id, 'match id should exist');
      assert.ok(match.fullName, 'match fullName should exist');
      assert.ok(typeof match.matchScore === 'number', 'matchScore should be a number');
      assert.ok(match.candidatePillars, 'candidatePillars should exist');
      assert.ok(Array.isArray(match.synergyFactors), 'synergyFactors should be an array');
    }
  });

  it('POST /api/venture/plan generates a structured plan with validation', async () => {
    const payload = {
      idea: 'AI verified talent graph for Web3 & AI founders',
      targetDomain: 'Web3 & AI Talent',
      stage: 'idea',
    };

    const res = await apiRequest('/api/venture/plan', {
      method: 'POST',
      body: payload,
    });

    assert.equal(res.status, 200);
    assert.ok(res.data.plan, 'plan object should exist');
    assert.ok(res.data.plan.problemStatement, 'problemStatement should exist');
    assert.ok(Array.isArray(res.data.plan.targetUsers), 'targetUsers should be an array');
    assert.ok(Array.isArray(res.data.plan.technicalMilestones), 'technicalMilestones should be an array');
    assert.ok(Array.isArray(res.data.plan.requiredTeamCapabilities), 'requiredTeamCapabilities should be an array');
    assert.ok(Array.isArray(res.data.plan.matchedGrants), 'matchedGrants should be an array');
  });

  it('POST /api/venture/plan rejects empty or short idea', async () => {
    const res = await apiRequest('/api/venture/plan', {
      method: 'POST',
      body: { idea: 'short' },
    });

    assert.equal(res.status, 400);
  });

  it('GET /api/credentials/public-key returns Ed25519 public key info', async () => {
    const res = await apiRequest('/api/credentials/public-key');
    assert.equal(res.status, 200);
    assert.equal(res.data.algorithm, 'Ed25519');
    assert.equal(res.data.network, 'WaveSync Verifiable Proof Registry v1');
  });

  it('GET /api/collab returns active collaboration posts', async () => {
    const res = await apiRequest('/api/collab');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data), 'posts should be an array');
  });

  it('GET /api/jobs returns active job listings', async () => {
    const res = await apiRequest('/api/jobs');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data), 'jobs should be an array');
  });

  it('GET /api/matching/founders calculates personalized pillars for authenticated student', async () => {
    const jwtSecret = process.env.JWT_SECRET || 'wavesync_dev_fallback_secret_key_32chars';
    const studentToken = (await import('jsonwebtoken')).default.sign(
      { id: 'f63fd6fb-0303-48c6-a35a-ab553d61d0ff', role: 'student' },
      jwtSecret,
      { expiresIn: '1h' }
    );
    const res = await apiRequest('/api/matching/founders', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.currentUserPillars, 'currentUserPillars should exist');
    assert.ok(res.data.currentUserPillars.engineering > 0, 'Engineering pillar must be > 0 for CSE student');
    assert.ok(Array.isArray(res.data.matches), 'matches should be an array');
  });

  it('GET /api/submissions/pending strictly enforces role authorization', async () => {
    // Unauthenticated
    const unauth = await apiRequest('/api/submissions/pending');
    assert.equal(unauth.status, 401);

    // Student role (forbidden from reviewer queue)
    const jwtSecret = process.env.JWT_SECRET || 'wavesync_dev_fallback_secret_key_32chars';
    const studentToken = (await import('jsonwebtoken')).default.sign(
      { id: 'f63fd6fb-0303-48c6-a35a-ab553d61d0ff', role: 'student' },
      jwtSecret,
      { expiresIn: '1h' }
    );
    const studentRes = await apiRequest('/api/submissions/pending', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(studentRes.status, 403, 'Student should be forbidden from accessing review queue');
  });
});

