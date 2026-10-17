// wavesync_backend/services/domainGuardrails.js

export const REFUSAL_RESPONSE =
  "I'm WaveSync AI, designed exclusively to help you use WaveSync. I can assist with opportunities, ventures, co-founder matching, networking, Build-to-Earn, credentials, profiles, messaging, and navigating the platform. I can't answer unrelated questions.";

export const AMBIGUOUS_RESPONSE =
  "Could you clarify how your question relates to WaveSync? I can help you find relevant opportunities, structure a venture, match with co-founders, submit code to Build-to-Earn, or navigate the platform.";

// Strict allowlist of valid internal application routes
export const ALLOWED_ROUTES = [
  '/',
  '/graph',
  '/opportunities',
  '/ventures',
  '/network',
  '/build-to-earn',
  '/messages',
  '/profile',
];

// Patterns that indicate clear prompt injection, system tampering, or persona shifting
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|your\s+|previous\s+|the\s+)*instructions/i,
  /ignore\s+(your\s+|all\s+|the\s+)*(guardrails|rules|system\s+prompt|guidelines)/i,
  /disregard\s+(all\s+|your\s+|previous\s+|the\s+)*(instructions|rules)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(a|an)?\s*(general|unrestricted|different|dan)/i,
  /act\s+as\s+(a|an)?\s*(unrestricted|general-purpose|jailbroken|evil|dan)/i,
  /reveal\s+(your\s+|the\s+)?(system\s+prompt|hidden\s+prompt|instructions|secret|api\s*key)/i,
  /tell\s+me\s+(your\s+|the\s+)?(system\s+prompt|instructions|secret|api\s*key)/i,
  /what\s+is\s+your\s+(system\s+prompt|initial\s+prompt|secret\s+key)/i,
  /print\s+(your\s+|the\s+)?(system\s+prompt|instructions|env)/i,
  /you\s+are\s+now\s+(a\s+)?(general|unrestricted|dan)/i,
  /bypass\s+(the|your|all)?\s*(guardrails|restrictions|policy|filter)/i,
  /do\s+anything\s+now/i,
  /hypothetical(ly)?\s+speaking,\s+if\s+you\s+could\s+answer\s+anything/i,
  /in\s+a\s+fictional\s+world\s+where\s+you\s+have\s+no\s+rules/i,
];

// Clear off-domain subject indicators (General algorithms, school essays, sports, politics, history, general dev)
const OFF_DOMAIN_PATTERNS = [
  /\b(linked\s*lists?|binary\s*search\s*trees?|quicksorts?|mergesorts?|dijkstras?|bubble\s*sorts?|red\s*black\s*trees?)\b/i,
  /\b(write\s+(a|an)?\s*(python|java|c\+\+|javascript|ruby|go|rust|php)\s*(program|script|code|function)\s*(to|that)?)\b/i,
  /\b(cricket|football|nfl|nba|fifa|ipl|world\s*cup\s*score|premier\s*league)\b/i,
  /\b(world\s*war|hitler|civil\s*war|treaty\s*of|ancient\s*rome|napoleon)\b/i,
  /\b(climate\s*change\s*essay|write\s+(an?\s*)?(essay|poem|song|story|joke)\s+about)\b/i,
  /\b(hack\s+(a|an|into|another)?\s*(website|wifi|server|account|instagram|facebook))\b/i,
  /\b(recipe\s+for|how\s+to\s+cook|ingredients\s+for)\b/i,
  /\b(stock\s*market|crypto\s*price|bitcoin\s*price|ethereum\s*price|invest\s+in\s+crypto)\b/i,
  /\b(weather\s+in|forecast\s+for|capital\s+of\s+[a-z]+)\b/i,
  /\b(latest\s*news\s*in|who\s+won\s+the\s+(election|match|game|super\s*bowl))\b/i,
  /\b(president\s+of|prime\s+minister\s+of|who\s+is\s+the\s+ceo\s+of\s+(apple|google|microsoft|tesla|meta|amazon))\b/i,
  /\b(tell\s+me\s+a\s+joke|play\s+(chess|a\s+game)|trivia\s+question)\b/i,
  /\b(solve\s+my\s+homework|math\s+equation|integrate|derivative\s+of)\b/i,
];

// Explicit WaveSync core domain topics
const WAVESYNC_TOPIC_REGEX = [
  /\b(wavesync|hyperstate|vericore)\b/i,
  /\b(opportunity|opportunities|job|jobs|internship|internships|bounty|bounties|grant|grants)\b/i,
  /\b(venture|ventures|co-?founder|co-?founders|startup|blueprint|synergy|milestone|collab)\b/i,
  /\b(network|alumni|mentor|mentors|mentorship|referral|referrals|directory|profile|profiles)\b/i,
  /\b(build-?to-?earn|bte|proof\s*of\s*work|deliverable|ed25519|cryptographic|verdict|audit\s*signature)\b/i,
  /\b(credential|credentials|review\s*queue|reviewer|verifiable)\b/i,
  /\b(message|messages|messaging|conversation|conversations)\b/i,
  /\b(3d\s*graph|opportunity\s*graph|ecosystem\s*visualizer|graph\s*node|dr\.?\s*tariq|elena\s*rostova)\b/i,
  /\b(how\s*to\s*apply|my\s*application|my\s*applications|my\s*submissions|my\s*ventures)\b/i,
  /\b(navigate|take\s*me\s*to|where\s*is|how\s*do\s*i\s*(find|view|open|access|use))\b/i,
];

// Contextual follow-up patterns (valid when preceding conversation was about WaveSync)
const CONTEXTUAL_FOLLOWUP_REGEX = [
  /^(how\s+long\s+does\s+(it|the\s+review)\s+take\??)$/i,
  /^(how\s+do\s+i\s+(do|apply|submit|join|sign)\s+(that|it)\??)$/i,
  /^(can\s+i\s+(edit|change|cancel|delete)\s+(it|my\s+submission|my\s+application)\??)$/i,
  /^(what\s+about\s+(the\s+second\s+one|the\s+milestones|the\s+requirements|equity|salary)\??)$/i,
  /^(who\s+can\s+(review|verify|sign)\s+(it|my\s+code)\??)$/i,
  /^(what\s+is\s+the\s+next\s+step\??)$/i,
  /^(tell\s+me\s+more\s*(about\s+that)?\??)$/i,
  /^(yes|no|thanks|thank\s+you|got\s+it|ok|okay)\b/i,
];

/**
 * Evaluates whether recent history was firmly within WaveSync's domain
 */
function hasRecentWaveSyncContext(history) {
  if (!Array.isArray(history) || history.length === 0) return false;
  // Inspect last 3 messages
  const recent = history.slice(-3);
  return recent.some((h) => {
    const text = h.content || '';
    return WAVESYNC_TOPIC_REGEX.some((re) => re.test(text));
  });
}

/**
 * Classifies a user query into:
 * - 'REJECTED': Prompt injection, off-domain trivia, general coding, sports, etc.
 * - 'ALLOWED': Clear WaveSync platform intent or legitimate conversational follow-up.
 * - 'AMBIGUOUS': Unclear or underspecified intent with no WaveSync connection.
 */
export function classifyDomainIntent(message, history = [], currentPath = '/') {
  if (!message || typeof message !== 'string') {
    return { status: 'REJECTED', reason: 'EMPTY_OR_INVALID' };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { status: 'REJECTED', reason: 'EMPTY_STRING' };
  }

  // 1. Strict Prompt Injection & System Tampering Check
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { status: 'REJECTED', reason: 'PROMPT_INJECTION_ATTEMPT' };
    }
  }

  // 2. Strict Off-Domain Subject Check (Always reject general code, sports, history, etc.)
  for (const pattern of OFF_DOMAIN_PATTERNS) {
    if (pattern.test(trimmed)) {
      // Even if user mentions "WaveSync" in "Write a python program for WaveSync" or "Explain linked lists on WaveSync",
      // general programming/algorithms and off-topic requests must be rejected.
      // Exception: asking what technologies WaveSync uses or how WaveSync's code audit works.
      const isTechAuditQuery = /\b(how\s*does\s*wavesync\s*(audit|sign|verify)|wavesync\s*stack|technologies\s*used\s*in\s*wavesync)\b/i.test(trimmed);
      if (!isTechAuditQuery) {
        return { status: 'REJECTED', reason: 'OFF_DOMAIN_TOPIC' };
      }
    }
  }

  // 3. Clear WaveSync Domain Topic Check
  const hasWaveSyncTopic = WAVESYNC_TOPIC_REGEX.some((re) => re.test(trimmed));
  if (hasWaveSyncTopic) {
    return { status: 'ALLOWED', reason: 'DIRECT_WAVESYNC_INTENT' };
  }

  // 4. Conversational Follow-up Check
  const isFollowup = CONTEXTUAL_FOLLOWUP_REGEX.some((re) => re.test(trimmed));
  if (isFollowup && hasRecentWaveSyncContext(history)) {
    return { status: 'ALLOWED', reason: 'CONTEXTUAL_WAVESYNC_FOLLOWUP' };
  }

  // 5. Short Greetings / Platform Inquiries
  if (/^(hello|hi|hey|help|greetings|what\s+can\s+you\s+do|who\s+are\s+you)\b/i.test(trimmed)) {
    return { status: 'ALLOWED', reason: 'PLATFORM_GREETING' };
  }

  // 6. Ambiguous / Underspecified Queries
  return { status: 'AMBIGUOUS', reason: 'UNCLEAR_INTENT' };
}
