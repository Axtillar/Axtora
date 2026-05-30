"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuthStore, AVATARS, type AvatarId, getAvatarEmoji } from "@/store/auth-store"
import { useFinanceStore, type CurrencyCode } from "@/store/finance-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { CURRENCY_LIST } from "@/lib/finance-helpers"
import { useTheme } from "next-themes"
import {
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Building2,
  Settings,
  Rocket,
  Check,
  Sun,
  Moon,
  Monitor,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Plane,
  Wallet,
} from "lucide-react"

const ONBOARDING_STEPS = [
  { id: "welcome", icon: Sparkles, label: "Welcome" },
  { id: "avatar", icon: User, label: "Profile" },
  { id: "workspace", icon: Building2, label: "Workspace" },
  { id: "preferences", icon: Settings, label: "Preferences" },
  { id: "launch", icon: Rocket, label: "Launch" },
]

const USE_CASES = [
  { id: "personal", icon: Wallet, label: "Personal Finance", desc: "Track daily expenses & savings" },
  { id: "student", icon: GraduationCap, label: "Student Budget", desc: "Manage allowance & expenses" },
  { id: "family", icon: Home, label: "Family Budget", desc: "Household income & expenses" },
  { id: "freelancer", icon: Briefcase, label: "Freelancer", desc: "Track project income & costs" },
  { id: "travel", icon: Plane, label: "Travel Planning", desc: "Budget trips & adventures" },
  { id: "goals", icon: Heart, label: "Goal Setting", desc: "Save for big purchases" },
]

/* ─── Welcome Step ─── */
function WelcomeStep({ userName }: { userName: string }) {
  const firstName = userName?.split(" ")[0] || "there"
  return (
    <div className="flex flex-col items-center text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="h-20 w-20 rounded-3xl bg-[#14B8A6] flex items-center justify-center shadow-xl shadow-[#14B8A6]/20 mb-6"
      >
        <Sparkles className="h-10 w-10 text-white" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl sm:text-4xl font-extrabold tracking-tight"
      >
        Welcome, {firstName}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mt-3 text-lg leading-relaxed max-w-md"
      >
        Let&apos;s set up your Axtora experience in just a few steps. It&apos;ll only take a minute.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 grid grid-cols-3 gap-4 max-w-sm"
      >
        {[
          { icon: User, label: "Profile" },
          { icon: Building2, label: "Workspace" },
          { icon: Settings, label: "Prefs" },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/30"
            >
              <div className="h-8 w-8 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-[#14B8A6]" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ─── Avatar/Profile Step ─── */
function AvatarStep() {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>("fox")
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  useEffect(() => {
    if (user?.avatarId) setSelectedAvatar(user.avatarId)
  }, [user])

  const handleSelect = (id: AvatarId) => {
    setSelectedAvatar(id)
    updateProfile({ avatarId: id })
  }

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold">Choose your avatar</h2>
        <p className="text-sm text-muted-foreground mt-1">Pick an avatar that represents you</p>
      </div>

      <motion.div
        key={selectedAvatar}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="flex justify-center mb-6"
      >
        <div className="h-20 w-20 rounded-2xl bg-[#14B8A6]/10 border-2 border-[#14B8A6] flex items-center justify-center">
          <span className="text-4xl">{getAvatarEmoji(selectedAvatar)}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => handleSelect(avatar.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all",
              selectedAvatar === avatar.id
                ? "border-[#14B8A6] bg-[#14B8A6]/10 scale-105"
                : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
            )}
          >
            <span className="text-2xl">{avatar.emoji}</span>
            <span className={cn(
              "text-[9px] font-bold leading-tight",
              selectedAvatar === avatar.id ? "text-[#14B8A6]" : "text-muted-foreground"
            )}>
              {avatar.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Workspace Step ─── */
function WorkspaceStep({ onRegisterSave }: { onRegisterSave: (fn: () => void) => void }) {
  const [workspaceName, setWorkspaceName] = useState("")
  const [selectedUse, setSelectedUse] = useState<string>("personal")
  const updateProfile = useAuthStore((s) => s.updateProfile)

  const handleSave = useCallback(() => {
    updateProfile({ workspaceName: workspaceName.trim() || "My Finances" })
  }, [workspaceName, updateProfile])

  useEffect(() => {
    onRegisterSave(handleSave)
  }, [handleSave, onRegisterSave])

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold">Set up your workspace</h2>
        <p className="text-sm text-muted-foreground mt-1">Name your workspace and tell us how you&apos;ll use Axtora</p>
      </div>

      <div className="space-y-2 max-w-sm mx-auto mb-8">
        <Label className="text-sm font-bold">Workspace Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="e.g., My Finances, Family Budget"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <Label className="text-sm font-bold mb-3 block text-center">How will you use Axtora?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {USE_CASES.map((useCase) => {
            const Icon = useCase.icon
            const isSelected = selectedUse === useCase.id
            return (
              <button
                key={useCase.id}
                type="button"
                onClick={() => setSelectedUse(useCase.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                  isSelected
                    ? "border-[#14B8A6] bg-[#14B8A6]/10"
                    : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                )}
              >
                <Icon className={cn("h-5 w-5", isSelected ? "text-[#14B8A6]" : "text-muted-foreground")} />
                <span className={cn("text-xs font-bold", isSelected ? "text-[#14B8A6]" : "text-foreground")}>{useCase.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{useCase.desc}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Preferences Step ─── */
function PreferencesStep({ onRegisterSave }: { onRegisterSave: (fn: () => void) => void }) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const updateSettings = useFinanceStore((s) => s.updateSettings)
  const { setTheme: setAppTheme } = useTheme()

  const handleSave = useCallback(() => {
    updateProfile({ preferredCurrency: currency, preferredTheme: theme })
    updateSettings({ currency })
    try { setAppTheme(theme === "system" ? "light" : theme) } catch { /* ignore */ }
  }, [currency, theme, updateProfile, updateSettings, setAppTheme])

  useEffect(() => {
    onRegisterSave(handleSave)
  }, [handleSave, onRegisterSave])

  const popularCurrencies = CURRENCY_LIST.slice(0, 8)
  const otherCurrencies = CURRENCY_LIST.slice(8)

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold">Customize your experience</h2>
        <p className="text-sm text-muted-foreground mt-1">Set your default currency and appearance</p>
      </div>

      <div className="max-w-sm mx-auto mb-8">
        <Label className="text-sm font-bold mb-3 block">Currency</Label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {popularCurrencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code as CurrencyCode)}
              className={cn(
                "flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all",
                currency === c.code
                  ? "border-[#14B8A6] bg-[#14B8A6]/10"
                  : "border-transparent bg-muted/50 hover:border-border"
              )}
            >
              <span className="text-base">{c.flag}</span>
              <span className={cn("text-[10px] font-bold", currency === c.code ? "text-[#14B8A6]" : "text-muted-foreground")}>{c.code}</span>
              <span className="text-[9px] text-muted-foreground">{c.symbol}</span>
            </button>
          ))}
        </div>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          {otherCurrencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} ({c.symbol}) — {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-sm mx-auto">
        <Label className="text-sm font-bold mb-3 block">Appearance</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "light" as const, icon: Sun, label: "Light" },
            { id: "dark" as const, icon: Moon, label: "Dark" },
            { id: "system" as const, icon: Monitor, label: "System" },
          ].map((t) => {
            const Icon = t.icon
            const isSelected = theme === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-[#14B8A6] bg-[#14B8A6]/10"
                    : "border-transparent bg-muted/50 hover:border-border"
                )}
              >
                <Icon className={cn("h-5 w-5", isSelected ? "text-[#14B8A6]" : "text-muted-foreground")} />
                <span className={cn("text-xs font-bold", isSelected ? "text-[#14B8A6]" : "text-foreground")}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Launch Step ─── */
function LaunchStep({ userName }: { userName: string }) {
  const firstName = userName?.split(" ")[0] || "there"
  return (
    <div className="flex flex-col items-center text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="h-20 w-20 rounded-3xl bg-[#14B8A6] flex items-center justify-center shadow-xl shadow-[#14B8A6]/20 mb-6"
      >
        <Rocket className="h-10 w-10 text-white" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl sm:text-4xl font-extrabold tracking-tight"
      >
        You&apos;re all set, {firstName}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mt-3 text-lg leading-relaxed max-w-md"
      >
        Your workspace is ready. Let&apos;s start managing your finances like a pro.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 space-y-3 max-w-xs w-full"
      >
        {[
          "Track income & expenses",
          "Set budgets & savings goals",
          "Manage wishlists & projects",
        ].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#14B8A6]/5 border border-[#14B8A6]/10"
          >
            <div className="h-6 w-6 rounded-full bg-[#14B8A6] flex items-center justify-center shrink-0">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">{item}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Main Onboarding Flow ─── */
export function OnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const user = useAuthStore((s) => s.user)
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)

  // Stable ref-based approach to collect save handlers from child steps
  // without polluting the global window object
  const workspaceSaveRef = useRef<(() => void) | null>(null)
  const prefsSaveRef = useRef<(() => void) | null>(null)

  const registerWorkspaceSave = useCallback((fn: () => void) => {
    workspaceSaveRef.current = fn
  }, [])

  const registerPrefsSave = useCallback((fn: () => void) => {
    prefsSaveRef.current = fn
  }, [])

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  const handleNext = () => {
    if (currentStep === 2) workspaceSaveRef.current?.()
    if (currentStep === 3) prefsSaveRef.current?.()

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleSkip = () => {
    completeOnboarding()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#14B8A6] flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-extrabold">Axtora</span>
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
            >
              Skip setup
            </button>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground font-semibold">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {ONBOARDING_STEPS[currentStep].label}
            </span>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {currentStep === 0 && <WelcomeStep userName={user?.name || ""} />}
            {currentStep === 1 && <AvatarStep />}
            {currentStep === 2 && <WorkspaceStep onRegisterSave={registerWorkspaceSave} />}
            {currentStep === 3 && <PreferencesStep onRegisterSave={registerPrefsSave} />}
            {currentStep === 4 && <LaunchStep userName={user?.name || ""} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-11 gap-2 font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className={cn(
              "h-11 gap-2 font-bold transition-all flex-1",
              "bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white"
            )}
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <>
                <Rocket className="h-4 w-4" />
                Launch Axtora
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
