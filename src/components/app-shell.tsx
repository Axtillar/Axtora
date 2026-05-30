"use client"

import { useFinanceStore, type ActiveSection } from "@/store/finance-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { useHydrated } from "@/hooks/use-hydrated"
import { Dashboard } from "@/components/dashboard"
import { IncomeSection } from "@/components/income-section"
import { ExpensesSection } from "@/components/expenses-section"
import { SavingsSection } from "@/components/savings-section"
import { WishlistSection } from "@/components/wishlist-section"
import { ProjectsSection } from "@/components/projects-section"
import { SettingsSection } from "@/components/settings-section"
import { HelpSection } from "@/components/help-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { AxtoraLogo } from "@/components/axtora-logo"
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Heart,
  Target,
  PiggyBank,
  Sun,
  Moon,
  Settings as SettingsIcon,
  HelpCircle,
  Loader2,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import { useAuthStore, getAvatarEmoji } from "@/store/auth-store"

function MobileThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-8 w-8"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

const mobileNavItems: {
  section: ActiveSection
  icon: React.ElementType
  label: string
}[] = [
  { section: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { section: "income", icon: Wallet, label: "Income" },
  { section: "expenses", icon: Receipt, label: "Expenses" },
  { section: "wishlist", icon: Heart, label: "Wishlist" },
  { section: "projects", icon: Target, label: "Projects" },
]

const sidebarMainItems: {
  section: ActiveSection
  icon: React.ElementType
  label: string
}[] = [
  { section: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { section: "income", icon: Wallet, label: "Income" },
  { section: "expenses", icon: Receipt, label: "Expenses" },
  { section: "savings", icon: PiggyBank, label: "Savings" },
  { section: "wishlist", icon: Heart, label: "Wishlist" },
  { section: "projects", icon: Target, label: "Projects" },
]

const sidebarBottomItems: {
  section: ActiveSection
  icon: React.ElementType
  label: string
}[] = [
  { section: "help", icon: HelpCircle, label: "Help" },
  { section: "settings", icon: SettingsIcon, label: "Settings" },
]

function renderSection(section: ActiveSection) {
  switch (section) {
    case "dashboard":
      return <Dashboard />
    case "income":
      return <IncomeSection />
    case "expenses":
      return <ExpensesSection />
    case "savings":
      return <SavingsSection />
    case "wishlist":
      return <WishlistSection />
    case "projects":
      return <ProjectsSection />
    case "settings":
      return <SettingsSection />
    case "help":
      return <HelpSection />
    default:
      return <Dashboard />
  }
}

export function AppShell() {
  const router = useRouter()
  const activeSection = useFinanceStore((s) => s.activeSection)
  const setActiveSection = useFinanceStore((s) => s.setActiveSection)
  const isMobile = useIsMobile()
  const isHydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Wait for finance store hydration only (auth is handled by page.tsx)
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#14B8A6]" />
          <p className="text-sm text-muted-foreground font-semibold">Loading Axtora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground h-screen sticky top-0">
          <div className="p-6">
            <AxtoraLogo size={36} showText textClassName="text-xl" />
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1">
            {sidebarMainItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.section
              return (
                <button
                  key={item.section}
                  onClick={() => setActiveSection(item.section)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-colors",
                    isActive
                      ? "bg-[#14B8A6]/10 text-[#14B8A6] border-l-2 border-[#14B8A6]"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent border-l-2 border-transparent"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              )
            })}
            <div className="my-2 border-t border-border/50" />
            {sidebarBottomItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.section
              return (
                <button
                  key={item.section}
                  onClick={() => setActiveSection(item.section)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-colors",
                    isActive
                      ? "bg-[#14B8A6]/10 text-[#14B8A6] border-l-2 border-[#14B8A6]"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent border-l-2 border-transparent"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="h-8 w-8 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
                <span className="text-base">{getAvatarEmoji(user?.avatarId)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user?.name || "User"}</p>
                {user?.isGuest && <p className="text-[10px] text-muted-foreground">Guest</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-muted-foreground hover:text-[#EF4444]"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-h-screen",
          isMobile ? "pb-20" : ""
        )}
      >
        {/* Mobile Header with Theme Toggle */}
        {isMobile && (
          <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AxtoraLogo size={28} showText textClassName="text-lg" />
              <span className="text-xs text-muted-foreground font-semibold">Hi, {user?.name?.split(" ")[0] || "User"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSection("help")}
                className="h-8 w-8"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSection("settings")}
                className="h-8 w-8"
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-muted-foreground hover:text-[#EF4444]"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <MobileThemeToggle />
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {renderSection(activeSection)}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-16">
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.section
              return (
                <button
                  key={item.section}
                  onClick={() => setActiveSection(item.section)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px] relative",
                    isActive
                      ? "text-[#14B8A6]"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform",
                      isActive && "scale-110"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[11px] font-bold",
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#14B8A6]" />
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
