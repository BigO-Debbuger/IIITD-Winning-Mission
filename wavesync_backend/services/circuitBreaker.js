// wavesync_backend/services/circuitBreaker.js

export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownPeriodMs = options.cooldownPeriodMs || 30000; // 30s
    this.state = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    this.consecutiveFailures = 0;
    this.lastFailureTime = null;
  }

  isOpen() {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.consecutiveFailures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }

  recordFailure(error) {
    this.consecutiveFailures += 1;
    this.lastFailureTime = Date.now();

    // Specific errors like 429 quota exhaustion or repeated timeouts immediately trip or advance breaker
    const isQuotaOrAuth =
      error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('API_KEY_INVALID');

    if (isQuotaOrAuth || this.consecutiveFailures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`⚠️ [CIRCUIT BREAKER OPEN]: Tripped after ${this.consecutiveFailures} failures. Pausing provider calls for ${this.cooldownPeriodMs / 1000}s.`);
    }
  }

  reset() {
    this.consecutiveFailures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }
}

// Global circuit breaker instance for Gemini AI calls
export const geminiCircuitBreaker = new CircuitBreaker();

/**
 * Wraps an async operation with a timeout
 */
export async function withTimeout(promise, timeoutMs = 5000, operationName = 'Operation') {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
