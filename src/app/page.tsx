"use client"

import { useSmartRouter } from "@/hooks/use-smart-router"
import { LandingPage } from "@/components/landing-page"

/**
 * Landing page (public).
 *
 * Smart routing:
 *   No user at all              → Show landing (this page)
 *   Has user (has account)      → Redirect to /login
 *   Authenticated + onboarded   → Redirect to /dashboard
 */
export default function HomePage() {
  const { ready, shouldRender } = useSmartRouter({
    expectedRoute: "/",
    allowedRoutes: ["/"],
  })

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!shouldRender) return null

  return <LandingPage />
}
