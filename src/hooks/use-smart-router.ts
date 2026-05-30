"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

type TargetRoute = "/" | "/login" | "/signup" | "/onboarding" | "/dashboard"

/**
 * Resolve the correct route based on current auth state.
 *
 * Logic:
 *   No user at all              → Landing  (/)
 *   Has user, NOT authenticated → Login    (/login)
 *   Authenticated, not onboarded, not guest → Onboarding (/onboarding)
 *   Authenticated, onboarded or guest       → Dashboard  (/dashboard)
 */
function resolveTargetRoute(
  user: { onboardingCompleted: boolean; isGuest: boolean } | null,
  isAuthenticated: boolean
): TargetRoute {
  if (!user) return "/"
  if (!isAuthenticated) return "/login"
  if (!user.onboardingCompleted && !user.isGuest) return "/onboarding"
  return "/dashboard"
}

interface UseSmartRouterOptions {
  /** The route this page represents — if the user should NOT be here, they get redirected */
  expectedRoute: TargetRoute
  /** Routes where it's okay to stay and render even if not the "ideal" target (e.g. signup page is fine for unauthenticated users) */
  allowedRoutes?: TargetRoute[]
}

export function useSmartRouter({ expectedRoute, allowedRoutes }: UseSmartRouterOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [ready, setReady] = useState(false)
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (!hasHydrated) {
      // Safety timeout — if hydration never fires, allow the page to render
      const t = setTimeout(() => {
        if (!hasRedirected.current) {
          hasRedirected.current = true
          setReady(true)
        }
      }, 1500)
      return () => clearTimeout(t)
    }

    if (hasRedirected.current) return
    hasRedirected.current = true

    const targetRoute = resolveTargetRoute(user, isAuthenticated)

    // If the target route matches our expected route or is in allowed routes, we can render
    const isAllowed =
      targetRoute === expectedRoute ||
      (allowedRoutes && allowedRoutes.includes(targetRoute))

    if (!isAllowed) {
      // User shouldn't be on this page — redirect them
      router.replace(targetRoute)
      // Don't set ready=true so the page stays blank during redirect
    } else {
      setReady(true)
    }
  }, [hasHydrated, user, isAuthenticated, expectedRoute, allowedRoutes, router, pathname])

  return { ready, shouldRender: ready }
}
