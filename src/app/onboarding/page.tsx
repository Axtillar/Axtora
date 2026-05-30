"use client"

import { useSmartRouter } from "@/hooks/use-smart-router"
import { OnboardingFlow } from "@/components/onboarding-flow"

/**
 * Onboarding flow page.
 *
 * Smart routing:
 *   Not authenticated → Redirect to /login
 *   Authenticated + not onboarded, not guest → Show onboarding (this page)
 *   Authenticated + onboarded or guest → Redirect to /dashboard
 */
export default function OnboardingPageRoute() {
  const { ready, shouldRender } = useSmartRouter({
    expectedRoute: "/onboarding",
    // Only onboarding is the correct target for this state
  })

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!shouldRender) return null

  return <OnboardingFlow />
}
