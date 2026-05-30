"use client"

import { useSmartRouter } from "@/hooks/use-smart-router"
import { SignupPage } from "@/components/signup-page"

/**
 * Signup page.
 *
 * Smart routing:
 *   No user at all or has user, NOT authenticated → Show signup
 *   Authenticated + not onboarded, not guest → Redirect to /onboarding
 *   Authenticated + onboarded or guest        → Redirect to /dashboard
 */
export default function SignupPageRoute() {
  const { ready, shouldRender } = useSmartRouter({
    expectedRoute: "/signup",
    allowedRoutes: ["/signup", "/", "/login"],
  })

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!shouldRender) return null

  return <SignupPage />
}
