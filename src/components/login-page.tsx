"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const login = useAuthStore((s) => s.login)
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  const user = useAuthStore((s) => s.user)

  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  useEffect(() => {
    if (hasHydrated && user && !user.isGuest) {
      setEmail(user.email)
    }
  }, [hasHydrated, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) { setError("Please enter your email"); return }
    if (!password) { setError("Please enter your password"); return }

    setIsLoading(true)
    try {
      const success = await login(email.trim(), password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password. Please try again.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = () => {
    loginAsGuest()
    router.push("/dashboard")
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-[#14B8A6]/8 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-[#14B8A6]/5 blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative z-10 w-full max-w-md mx-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }} className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#14B8A6]/20">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">Welcome back</span>
            <p className="text-sm text-muted-foreground">Sign in to your Axtora account</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-11 pl-10" autoFocus />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="h-11 pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="px-3 py-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20">
                  <p className="text-xs font-bold text-[#EF4444]">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" disabled={isLoading} className={cn("w-full h-11 text-sm font-bold gap-2 transition-all", "bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white")}>
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-semibold">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button variant="outline" onClick={handleGuestLogin} className="w-full h-11 text-sm font-bold gap-2 border-dashed">
            Continue as Guest
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-5">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={() => router.push("/signup")} className="text-[#14B8A6] font-bold hover:underline">
              Sign up
            </button>
          </p>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }} className="text-center mt-6">
          <button onClick={() => router.push("/")} className="text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors">
            &larr; Back to home
          </button>
        </motion.p>
      </motion.div>
    </div>
  )
}
