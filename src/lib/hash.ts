/**
 * Shared hashing utility for Axtora.
 * Uses SHA-256 via the Web Crypto API — irreversible, safe for localStorage.
 */

const APP_SALT = "axtora-v3-security-salt"

export async function hashSecret(secret: string): Promise<string> {
  const salted = APP_SALT + ":" + secret
  const encoder = new TextEncoder()
  const data = encoder.encode(salted)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Synchronous fallback for comparing already-hashed values.
 * Use hashSecret() for all new hashing operations.
 */
export function isHashed(value: string): boolean {
  // SHA-256 produces a 64-char hex string
  return /^[0-9a-f]{64}$/.test(value)
}
