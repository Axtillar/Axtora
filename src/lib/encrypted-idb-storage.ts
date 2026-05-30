"use client"

/**
 * DEPRECATED: This module is no longer used for storage.
 * Axtora now uses localStorage directly via Zustand persist middleware.
 * This file is kept only for the clearAllIDBData utility used by error boundary.
 *
 * DO NOT use encryptedIDBStorage — it was the cause of infinite loading bugs.
 */

// ─── Utility: Clear all IndexedDB data ─────────────────────────────────

export async function clearAllIDBData(): Promise<void> {
  try {
    if (typeof indexedDB !== "undefined") {
      indexedDB.deleteDatabase("axtora-secure-db")
    }
  } catch (e) {
    console.warn("[Axtora] IndexedDB clear error:", e)
  }
}
