"use client"

import { useState, useEffect } from "react"
import { useFinanceStore } from "@/store/finance-store"

/**
 * Hook that returns true once Zustand persist has rehydrated from storage.
 * Includes a safety timeout to prevent infinite loading.
 */
export function useHydrated() {
  const hasHydrated = useFinanceStore((s) => s._hasHydrated)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (hasHydrated) {
      setReady(true)
      return
    }
    // Safety: force render after 2s even if hydration didn't fire
    const t = setTimeout(() => setReady(true), 2000)
    return () => clearTimeout(t)
  }, [hasHydrated])

  return ready
}
