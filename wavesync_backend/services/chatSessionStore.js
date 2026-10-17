// wavesync_backend/services/chatSessionStore.js

// In-memory session store mapping sessionKey (userId or anonymous sessionId) -> conversation history
const sessionStore = new Map();
const MAX_MESSAGES_PER_SESSION = 50;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class ChatSessionStore {
  static getSessionKey(user, sessionId) {
    if (user && user.id) {
      return `user_${user.id}`;
    }
    // Prevent unauthenticated callers from spoofing a user_ prefix
    const cleanSessionId = (sessionId || "anonymous_default").replace(/^user_/, "guest_user_");
    return `session_${cleanSessionId}`;
  }

  static getHistory(sessionKey) {
    const session = sessionStore.get(sessionKey);
    if (!session) return [];
    // Check TTL
    if (Date.now() - session.updatedAt > SESSION_TTL_MS) {
      sessionStore.delete(sessionKey);
      return [];
    }
    return session.messages;
  }

  static appendMessage(sessionKey, messageObj) {
    let session = sessionStore.get(sessionKey);
    if (!session || Date.now() - session.updatedAt > SESSION_TTL_MS) {
      session = {
        sessionKey,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    session.messages.push({
      id: messageObj.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: messageObj.role, // 'user' | 'assistant'
      content: messageObj.content,
      actions: messageObj.actions || [],
      timestamp: messageObj.timestamp || new Date().toISOString(),
    });

    if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
      session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
    }

    session.updatedAt = Date.now();
    sessionStore.set(sessionKey, session);
    return session.messages;
  }

  static clearHistory(sessionKey) {
    const existed = sessionStore.has(sessionKey);
    sessionStore.delete(sessionKey);
    return existed;
  }
}
