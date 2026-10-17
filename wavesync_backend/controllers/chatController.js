// wavesync_backend/controllers/chatController.js
import { generateChatResponse } from "../services/aiChatService.js";
import { ChatSessionStore } from "../services/chatSessionStore.js";

// Rate limiting map: sessionKey -> timestamp of last message
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 800; // minimum 800ms between messages to prevent spam

// @desc    Send a message to WaveSync AI Assistant
// @route   POST /api/chat
// @access  Public (Optional auth for personalized data)
export const sendMessage = async (req, res, next) => {
  try {
    const { message, currentPath = "/", sessionId } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ message: "A message string is required." });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        message: "Message exceeds maximum allowed length of 2,000 characters.",
      });
    }

    const sessionKey = ChatSessionStore.getSessionKey(req.user, sessionId);

    // Simple rate limiting
    const lastRequestTime = rateLimitMap.get(sessionKey);
    const now = Date.now();
    if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
      return res.status(429).json({
        message: "Please wait a moment before sending another message.",
      });
    }
    rateLimitMap.set(sessionKey, now);

    // Fetch existing history to provide multi-turn conversation context
    const history = ChatSessionStore.getHistory(sessionKey);

    // Generate assistant response
    const { reply, actions, provider, isLiveLLM } = await generateChatResponse({
      message: message.trim(),
      history,
      currentPath,
      user: req.user,
    });

    // Record user message & assistant response in session store
    ChatSessionStore.appendMessage(sessionKey, {
      role: "user",
      content: message.trim(),
    });

    ChatSessionStore.appendMessage(sessionKey, {
      role: "assistant",
      content: reply,
      actions,
    });

    const updatedHistory = ChatSessionStore.getHistory(sessionKey);

    return res.json({
      reply,
      actions,
      provider,
      isLiveLLM,
      history: updatedHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session chat history
// @route   GET /api/chat/history
// @access  Public (Optional auth)
export const getHistory = async (req, res) => {
  const sessionId = req.query.sessionId;
  const sessionKey = ChatSessionStore.getSessionKey(req.user, sessionId);
  const history = ChatSessionStore.getHistory(sessionKey);
  return res.json({ history });
};

// @desc    Clear session chat history
// @route   DELETE /api/chat/history/:conversationId?
// @access  Public (Optional auth)
export const clearHistory = async (req, res) => {
  const sessionId = req.params.conversationId || req.query.sessionId;
  const sessionKey = ChatSessionStore.getSessionKey(req.user, sessionId);
  ChatSessionStore.clearHistory(sessionKey);
  return res.json({ message: "Conversation history cleared successfully." });
};

// @desc    Get AI service status
// @route   GET /api/chat/status
// @access  Public
export const getStatus = async (req, res) => {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch {}

  const isConfigured = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ""
  );
  return res.json({
    isConfigured,
    provider: "google-gemini",
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  });
};
