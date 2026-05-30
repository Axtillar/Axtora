"use client"

import { useSmartRouter } from "@/hooks/use-smart-router"
import { LoginPage } from "@/components/login-page"

/**
 * Login page.
 *
 * Smart routing:
 *   No user at all              → Show login (with option to go to signup or landing)
 *   Has user, NOT authenticated → Show login (email pre-filled)
 *   Authenticated + not onboarded, not guest → Redirect to /onboarding
 *   Authenticated + onboarded or guest        → Redirect to /dashboard
 */
export default function LoginPageRoute() {
  const { ready, shouldRender } = useSmartRouter({
    expectedRoute: "/login",
    allowedRoutes: ["/login", "/"],
  })

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!shouldRender) return null

  return <LoginPage />
}
