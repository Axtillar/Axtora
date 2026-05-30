"use client"

import { useSmartRouter } from "@/hooks/use-smart-router"
import { AppShell } from "@/components/app-shell"

/**
 * Dashboard (AppShell) page.
 *
 * Smart routing:
 *   Not authenticated → Redirect to /login
 *   Authenticated + not onboarded, not guest → Redirect to /onboarding
 *   Authenticated + onboarded or guest → Show dashboard (this page)
 */
export default function DashboardPageRoute() {
  const { ready, shouldRender } = useSmartRouter({
    expectedRoute: "/dashboard",
  })

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!shouldRender) return null

  return <AppShell />
}
