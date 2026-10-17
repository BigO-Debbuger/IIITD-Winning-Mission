// wavesync_backend/tests/network_workflows.test.js
process.env.NODE_ENV = 'test';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { prisma } from '../config/prisma.js';

let server;
let baseUrl;
let isDbConnected = false;
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

describe('WaveSync Core Alumni Networking System API', () => {
  let studentUser;
  let alumniUser;
  let outsiderUser;
  let studentToken;
  let alumniToken;
  let outsiderToken;
  let createdConnectionId;
  let createdConversationId;

  before(async () => {
    try {
      await prisma.$queryRaw`SELECT 1;`;
      isDbConnected = true;

      // Ensure test users exist with network fields
      studentUser = await prisma.user.upsert({
        where: { email: 'student_net_test@wavesync.internal' },
        update: {
          fullName: 'Siddharth Student',
          role: 'student',
          institution: 'BITS Pilani',
          graduationYear: 2026,
          skills: ['React', 'TypeScript', 'Node.js', 'Machine Learning'],
          interests: ['AI Startups', 'Fintech', 'Mentorship'],
          headline: 'CS Undergrad & Full-Stack Builder',
          visibilityMode: 'public',
          isVerified: true
        },
        create: {
          email: 'student_net_test@wavesync.internal',
          password: 'hashed_password_placeholder',
          fullName: 'Siddharth Student',
          role: 'student',
          institution: 'BITS Pilani',
          graduationYear: 2026,
          skills: ['React', 'TypeScript', 'Node.js', 'Machine Learning'],
          interests: ['AI Startups', 'Fintech', 'Mentorship'],
          headline: 'CS Undergrad & Full-Stack Builder',
          visibilityMode: 'public',
          isVerified: true
        }
      });

      alumniUser = await prisma.user.upsert({
        where: { email: 'alumni_net_test@wavesync.internal' },
        update: {
          fullName: 'Priya Alumna',
          role: 'alumni',
          institution: 'BITS Pilani',
          graduationYear: 2020,
          skills: ['System Design', 'Machine Learning', 'Go', 'Distributed Systems'],
          interests: ['Mentoring', 'Angel Investing', 'AI Research'],
          headline: 'Staff ML Engineer @ Top Tech',
          isAvailableForMentoring: true,
          willingToRefer: true,
          visibilityMode: 'public',
          isVerified: true
        },
        create: {
          email: 'alumni_net_test@wavesync.internal',
          password: 'hashed_password_placeholder',
          fullName: 'Priya Alumna',
          role: 'alumni',
          institution: 'BITS Pilani',
          graduationYear: 2020,
          skills: ['System Design', 'Machine Learning', 'Go', 'Distributed Systems'],
          interests: ['Mentoring', 'Angel Investing', 'AI Research'],
          headline: 'Staff ML Engineer @ Top Tech',
          isAvailableForMentoring: true,
          willingToRefer: true,
          visibilityMode: 'public',
          isVerified: true
        }
      });

      outsiderUser = await prisma.user.upsert({
        where: { email: 'outsider_net_test@wavesync.internal' },
        update: {
          fullName: 'Outsider Test',
          role: 'student',
          institution: 'Other University',
          isVerified: true
        },
        create: {
          email: 'outsider_net_test@wavesync.internal',
          password: 'hashed_password_placeholder',
          fullName: 'Outsider Test',
          role: 'student',
          institution: 'Other University',
          isVerified: true
        }
      });

      studentToken = makeToken(studentUser);
      alumniToken = makeToken(alumniUser);
      outsiderToken = makeToken(outsiderUser);

      // Clean up previous test connections/mentorships between these test users
      await prisma.connection.deleteMany({
        where: {
          OR: [
            { requesterId: studentUser.id, recipientId: alumniUser.id },
            { requesterId: alumniUser.id, recipientId: studentUser.id }
          ]
        }
      });
      await prisma.mentorship.deleteMany({
        where: {
          studentId: studentUser.id,
          alumniId: alumniUser.id
        }
      });
    } catch (err) {
      console.warn('Database test connection notice:', err.message);
      isDbConnected = false;
    }

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

  it('GET /api/network/people returns directory with filters and auto-seeded profiles', async () => {
    const res = await apiRequest('/api/network/people?role=alumni');
    assert.equal(res.status, 200);
    assert.ok(res.data.success, 'response must have success=true');
    assert.ok(Array.isArray(res.data.people), 'people must be an array');
    assert.ok(res.data.people.length > 0, 'should have alumni profiles');
    const hasPriya = res.data.people.some((p) => p.email === 'alumni_net_test@wavesync.internal');
    assert.ok(hasPriya, 'Alumni test user should appear in alumni directory');
  });

  it('GET /api/network/people/:id returns detailed public profile with proof and connection state', async () => {
    const res = await apiRequest(`/api/network/people/${alumniUser.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.person.id, alumniUser.id);
    assert.equal(res.data.person.connectionStatus, 'none');
    assert.ok(Array.isArray(res.data.person.skills));
  });

  it('POST /api/network/connections rejects self-connection attempt with HTTP 400', async () => {
    const res = await apiRequest('/api/network/connections', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { recipientId: studentUser.id, note: 'Connecting with myself' }
    });
    assert.equal(res.status, 400);
    assert.match(res.data.message, /cannot connect with yourself/i);
  });

  it('POST /api/network/connections successfully sends connection request', async () => {
    const res = await apiRequest('/api/network/connections', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        recipientId: alumniUser.id,
        note: 'Hi Priya, I admire your work in distributed ML systems!'
      }
    });
    assert.equal(res.status, 201);
    assert.ok(res.data.connection.id);
    assert.equal(res.data.connection.status, 'pending');
    createdConnectionId = res.data.connection.id;
  });

  it('POST /api/network/connections blocks duplicate pending requests with HTTP 400 or 409', async () => {
    const res = await apiRequest('/api/network/connections', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { recipientId: alumniUser.id }
    });
    assert.ok([400, 409].includes(res.status), 'Should return 400 or 409 on duplicate request');
    assert.match(res.data.message, /already sent|already connected|pending/i);
  });

  it('PATCH /api/network/connections/:id prevents sender from accepting their own request (HTTP 403)', async () => {
    const res = await apiRequest(`/api/network/connections/${createdConnectionId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { action: 'accept' }
    });
    assert.equal(res.status, 403);
    assert.match(res.data.message, /only the recipient/i);
  });

  it('PATCH /api/network/connections/:id recipient accepts request & establishes conversation', async () => {
    const res = await apiRequest(`/api/network/connections/${createdConnectionId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${alumniToken}` },
      body: { action: 'accept' }
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.connection.status, 'accepted');
  });

  it('GET /api/network/connections returns list of established connections', async () => {
    const res = await apiRequest('/api/network/connections', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.connections));
    const connectedToPriya = res.data.connections.some((c) => c.otherUser.id === alumniUser.id);
    assert.ok(connectedToPriya, 'Student should see Priya in established connections');
  });

  it('POST /api/network/mentorship-requests submits mentorship request with topic', async () => {
    const res = await apiRequest('/api/network/mentorship-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        mentorId: alumniUser.id,
        topic: 'Distributed ML Pipeline Scaling',
        notes: 'Seeking advice on thesis architecture and production deployments.'
      }
    });
    assert.equal(res.status, 201);
    assert.ok(res.data.request.id);
    assert.equal(res.data.request.status, 'pending');
  });

  it('GET /api/network/conversations returns conversation established between connected users', async () => {
    const res = await apiRequest('/api/network/conversations', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.conversations));
    assert.ok(res.data.conversations.length > 0);
    createdConversationId = res.data.conversations[0].id;
    assert.ok(createdConversationId);
  });

  it('POST /api/network/conversations/:id/messages sends message between authorized participants', async () => {
    const res = await apiRequest(`/api/network/conversations/${createdConversationId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { content: 'Hello Priya, thanks for connecting!' }
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.message.content, 'Hello Priya, thanks for connecting!');
    assert.equal(res.data.message.senderId, studentUser.id);
  });

  it('POST /api/network/conversations/:id/messages blocks unauthorized non-participants with HTTP 403', async () => {
    const res = await apiRequest(`/api/network/conversations/${createdConversationId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${outsiderToken}` },
      body: { content: 'Sneaking into private conversation' }
    });
    assert.equal(res.status, 403);
  });

  it('GET /api/network/recommendations returns explainable recommendations with deterministic reasons', async () => {
    const res = await apiRequest('/api/network/recommendations', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.recommendations));
    assert.ok(res.data.recommendations.length > 0);
    const topRec = res.data.recommendations[0];
    assert.ok(typeof topRec.score === 'number');
    assert.ok(topRec.explanation, 'Recommendation must have explainable reason string');
    assert.ok(Array.isArray(topRec.reasons), 'reasons must be an array of badges');
  });

  it('POST /api/network/outcomes records verified career/networking outcome', async () => {
    const res = await apiRequest('/api/network/outcomes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        otherUserId: alumniUser.id,
        outcomeType: 'referral_received',
        title: 'Referral for ML Systems Engineering Role',
        details: 'Received internal referral from Priya after portfolio review.',
        metrics: 'Fast-tracked to interview stage'
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.outcome.outcomeType, 'referral_received');
  });

  it('GET /api/network/outcomes returns recorded outcomes for authenticated user', async () => {
    const res = await apiRequest('/api/network/outcomes', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.outcomes));
    assert.ok(res.data.outcomes.length > 0);
    assert.equal(res.data.outcomes[0].outcomeType, 'referral_received');
  });
});
