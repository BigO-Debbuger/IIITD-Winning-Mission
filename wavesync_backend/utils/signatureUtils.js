// wavesync_backend/utils/signatureUtils.js
// Ed25519 signing and verification for Build-to-Earn review integrity.
//
// KEY MANAGEMENT:
//   Private key → WAVESYNC_SIGNING_PRIVATE_KEY in .env  (base64url-encoded, NEVER committed)
//   Public key  → WAVESYNC_SIGNING_PUBLIC_KEY  in .env  (base64url-encoded, safe to share)
//
// To generate a keypair (one-time, run in Node REPL):
//   const { generateKeyPairSync } = await import('crypto');
//   const { privateKey, publicKey } = generateKeyPairSync('ed25519');
//   console.log('PRIV:', privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64url'));
//   console.log('PUB:',  publicKey.export({  type: 'spki', format: 'der' }).toString('base64url'));

import { createPrivateKey, createPublicKey, sign, verify } from "crypto";

// ---------------------------------------------------------------------------
// Internal helpers — load keys lazily so the module is importable in tests
// without the env vars set (signing will just be skipped gracefully).
// ---------------------------------------------------------------------------
const getPrivateKey = () => {
  const raw = process.env.WAVESYNC_SIGNING_PRIVATE_KEY;
  if (!raw || raw.trim() === "") return null;
  try {
    const der = Buffer.from(raw.trim(), "base64url");
    return createPrivateKey({ key: der, format: "der", type: "pkcs8" });
  } catch {
    return null;
  }
};

const getPublicKey = () => {
  const raw = process.env.WAVESYNC_SIGNING_PUBLIC_KEY;
  if (!raw || raw.trim() === "") return null;
  try {
    const der = Buffer.from(raw.trim(), "base64url");
    return createPublicKey({ key: der, format: "der", type: "spki" });
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// buildCanonicalPayload
// Produces the exact string that is signed, so verifiers can reproduce it.
// Format: "<submissionId>:<reviewerId>:<verdict>:<iso8601timestamp>"
// ---------------------------------------------------------------------------
export const buildCanonicalPayload = (submissionId, reviewerId, verdict, isoTimestamp) => {
  if (!submissionId || !reviewerId || !verdict || !isoTimestamp) {
    throw new Error("All four payload fields are required to build a canonical signature payload.");
  }
  // Guard against colon injection in any individual field
  for (const [name, val] of [["submissionId", submissionId], ["reviewerId", reviewerId], ["verdict", verdict]]) {
    if (typeof val !== "string" || val.includes(":")) {
      throw new Error(`Field '${name}' must not contain a colon character.`);
    }
  }
  return `${submissionId}:${reviewerId}:${verdict}:${isoTimestamp}`;
};

// ---------------------------------------------------------------------------
// signPayload
// Signs the canonical payload string with the Ed25519 private key.
// Returns { signedPayload, signature } on success, or null if the key is
// not configured (safe degradation — review is stored without a signature).
// ---------------------------------------------------------------------------
export const signPayload = (canonicalPayload) => {
  const privateKey = getPrivateKey();
  if (!privateKey) return null;

  try {
    const sigBuffer = sign(null, Buffer.from(canonicalPayload, "utf8"), privateKey);
    return {
      signedPayload: canonicalPayload,
      signature: sigBuffer.toString("base64url"),
    };
  } catch (err) {
    console.warn("⚠️ Ed25519 signing failed (review stored without signature):", err.message);
    return null;
  }
};

// ---------------------------------------------------------------------------
// verifySignature
// Verifies a stored signature against the canonical payload.
// Returns true/false; never throws to callers.
// ---------------------------------------------------------------------------
export const verifySignature = (canonicalPayload, signatureBase64url) => {
  if (!canonicalPayload || !signatureBase64url) return false;

  const publicKey = getPublicKey();
  if (!publicKey) return false;

  try {
    const sigBuffer = Buffer.from(signatureBase64url, "base64url");
    return verify(null, Buffer.from(canonicalPayload, "utf8"), publicKey, sigBuffer);
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// isSigningConfigured
// Exported so controllers can include signing status in responses.
// ---------------------------------------------------------------------------
export const isSigningConfigured = () =>
  Boolean(process.env.WAVESYNC_SIGNING_PRIVATE_KEY?.trim()) &&
  Boolean(process.env.WAVESYNC_SIGNING_PUBLIC_KEY?.trim());
