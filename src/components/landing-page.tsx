"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Wallet,
  Receipt,
  Target,
  Heart,
  Shield,
  Wifi,
  Smartphone,
  Moon,
  Sun,
  ChevronDown,
  BarChart3,
  PiggyBank,
  Globe,
  Zap,
  Lock,
  Download,
  Check,
} from "lucide-react"

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-[#14B8A6]/8 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-[#14B8A6]/5 blur-[100px] animate-pulse [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[80px] animate-pulse [animation-delay:4s]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(20,184,166,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}

function FloatingCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn("relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 shadow-lg transition-shadow hover:shadow-xl", className)}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ icon: Icon, title, description, color, bgColor, delay }: { icon: React.ElementType; title: string; description: string; color: string; bgColor: string; delay: number }) {
  return (
    <FloatingCard delay={delay} className="group">
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center mb-4", bgColor)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <h3 className="text-base font-extrabold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </FloatingCard>
  )
}

function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) { setCount(value); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] tabular-nums">{count}{suffix}</p>
      <p className="text-sm text-muted-foreground font-semibold mt-1">{label}</p>
    </div>
  )
}

function PricingCard({ title, price, description, features, highlighted = false, delay, onCta }: { title: string; price: string; description: string; features: string[]; highlighted?: boolean; delay: number; onCta: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn("relative rounded-2xl border p-6 sm:p-8 flex flex-col", highlighted ? "border-[#14B8A6] bg-[#14B8A6]/5 shadow-lg shadow-[#14B8A6]/10" : "border-border/50 bg-card/80 backdrop-blur-xl")}
    >
      {highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#14B8A6] text-white text-xs font-bold rounded-full">Popular</div>}
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <p className="text-3xl font-extrabold mt-4">{price}</p>
      <ul className="space-y-2.5 mt-6 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-[#14B8A6] shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button onClick={onCta} className={cn("mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all", highlighted ? "bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90" : "bg-muted text-foreground hover:bg-muted/80")}>
        Get Started <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.section ref={ref} id={id} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: "easeOut" }} className={cn("relative", className)}>
      {children}
    </motion.section>
  )
}

export function LandingPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = theme === "dark"

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnimatedGrid />

      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#14B8A6] flex items-center justify-center"><BarChart3 className="h-4.5 w-4.5 text-white" /></div>
            <span className="text-xl font-extrabold tracking-tight">Axtora</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/login")} className="hidden sm:block text-sm text-muted-foreground hover:text-foreground font-semibold transition-colors">Sign In</button>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun className="h-4 w-4" /></motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon className="h-4 w-4" /></motion.div>
                )}
              </AnimatePresence>
            </button>
            <button onClick={() => router.push("/signup")} className="hidden sm:flex items-center gap-2 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => router.push("/signup")} className="sm:hidden flex items-center gap-1 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white px-4 py-2 rounded-xl text-sm font-bold">
              Start <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 mb-6">
              <Zap className="h-3.5 w-3.5 text-[#14B8A6]" />
              <span className="text-xs font-bold text-[#14B8A6]">100% Free &amp; Open Source</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Your finances,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] to-emerald-400">simplified</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="text-lg sm:text-xl text-muted-foreground mt-5 leading-relaxed max-w-2xl mx-auto">
              Track income, expenses, savings, wishlists, and projects — all in one beautiful app. No sign-ups, no servers, no subscriptions.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <button onClick={() => router.push("/signup")} className="group flex items-center gap-2.5 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white px-8 py-3.5 rounded-2xl text-base font-bold transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl hover:shadow-[#14B8A6]/30">
                Get Started — It&apos;s Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#features" className="flex items-center gap-2 bg-muted/50 hover:bg-muted px-6 py-3.5 rounded-2xl text-sm font-bold transition-colors">
                Learn More <ChevronDown className="h-4 w-4 animate-bounce" />
              </a>
            </motion.div>
            <p className="text-xs text-muted-foreground mt-4">
              Already have an account?{" "}
              <button onClick={() => router.push("/login")} className="text-[#14B8A6] font-bold hover:underline">Sign in</button>
            </p>

            {/* App Preview Mockup */}
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }} className="mt-14 sm:mt-20 relative">
              <div className="relative mx-auto max-w-2xl rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-muted/20">
                  <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400/80" /><div className="h-3 w-3 rounded-full bg-yellow-400/80" /><div className="h-3 w-3 rounded-full bg-green-400/80" /></div>
                  <div className="flex-1 text-center"><span className="text-[11px] text-muted-foreground font-medium">axtora.app</span></div>
                  <div className="w-[52px]" />
                </div>
                <div className="p-5 space-y-4">
                  <div className="text-left"><p className="text-xl font-extrabold">Welcome back!</p><p className="text-xs text-muted-foreground font-semibold">Your finances at a glance</p></div>
                  <div className="rounded-xl bg-[#14B8A6]/10 border border-[#14B8A6]/20 p-4">
                    <p className="text-xs text-muted-foreground font-bold">Available Balance</p>
                    <p className="text-2xl font-extrabold mt-0.5">$3,655.00</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5"><div className="h-5 w-5 rounded-full bg-[#14B8A6]/20 flex items-center justify-center"><ArrowRight className="h-2.5 w-2.5 text-[#14B8A6] rotate-[-45deg]" /></div><div><p className="text-[10px] text-muted-foreground font-semibold">Income</p><p className="text-xs font-bold text-[#14B8A6]">$6,500</p></div></div>
                      <div className="flex items-center gap-1.5"><div className="h-5 w-5 rounded-full bg-[#EF4444]/20 flex items-center justify-center"><ArrowRight className="h-2.5 w-2.5 text-[#EF4444] rotate-[45deg]" /></div><div><p className="text-[10px] text-muted-foreground font-semibold">Expenses</p><p className="text-xs font-bold text-[#EF4444]">$2,845</p></div></div>
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 55, 35, 65, 50, 72].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 1 + i * 0.1, duration: 0.5 }} className={cn("flex-1 rounded-t-sm", i < 3 ? "bg-[#14B8A6]/40" : "bg-[#14B8A6]")} />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Wallet, label: "Income", color: "text-[#14B8A6]" },
                      { icon: Receipt, label: "Expense", color: "text-[#EF4444]" },
                      { icon: Target, label: "Project", color: "text-violet-500" },
                      { icon: Heart, label: "Wishlist", color: "text-pink-500" },
                    ].map((action) => {
                      const Icon = action.icon
                      return <div key={action.label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30"><Icon className={cn("h-3.5 w-3.5", action.color)} /><span className="text-[10px] font-bold text-muted-foreground">{action.label}</span></div>
                    })}
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 -z-10 bg-gradient-to-b from-[#14B8A6]/10 via-transparent to-transparent rounded-3xl blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <Section className="py-12 sm:py-16 border-y border-border/30 bg-muted/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <StatCounter value={35} suffix="+" label="Currencies Supported" />
            <StatCounter value={100} suffix="%" label="Offline Capable" />
            <StatCounter value={0} label="Server Dependencies" />
            <StatCounter value={5} suffix="+" label="Core Features" />
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section id="features" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-bold text-[#14B8A6] mb-2 tracking-wide uppercase">Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need to manage your money</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">Axtora combines powerful financial tracking with a clean, intuitive design. No bloat, no complexity — just the tools you actually need.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <FeatureCard icon={Wallet} title="Income Tracking" description="Track multiple income sources with flexible frequencies — weekly, monthly, yearly, or one-time." color="text-[#14B8A6]" bgColor="bg-[#14B8A6]/10" delay={0.1} />
            <FeatureCard icon={Receipt} title="Expense Management" description="Categorize and track every expense. See spending breakdowns by category with visual charts." color="text-[#EF4444]" bgColor="bg-[#EF4444]/10" delay={0.15} />
            <FeatureCard icon={PiggyBank} title="Savings & Budgets" description="Set category budgets and track your savings rate. Get intelligent insights on where to cut back." color="text-amber-500" bgColor="bg-amber-500/10" delay={0.2} />
            <FeatureCard icon={Heart} title="Wishlist" description="Save items you want to buy with prices, links, and priorities. See instantly if you can afford them." color="text-pink-500" bgColor="bg-pink-500/10" delay={0.25} />
            <FeatureCard icon={Target} title="Projects & Goals" description="Plan big purchases or life goals with itemized breakdowns. Track progress with visual indicators." color="text-violet-500" bgColor="bg-violet-500/10" delay={0.3} />
            <FeatureCard icon={BarChart3} title="Smart Dashboard" description="Beautiful charts showing income vs expenses trends, top spending categories, and savings rate." color="text-[#14B8A6]" bgColor="bg-[#14B8A6]/10" delay={0.35} />
          </div>
        </div>
      </Section>

      {/* Privacy */}
      <Section className="py-20 sm:py-28 bg-muted/10 border-y border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-bold text-[#14B8A6] mb-2 tracking-wide uppercase">Privacy First</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your data never leaves your device</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">Unlike most finance apps that store your data on remote servers, Axtora keeps everything local. No accounts, no tracking, no analytics.</p>
              <div className="space-y-4 mt-8">
                {[
                  { icon: Shield, title: "No data collection", desc: "Zero telemetry, zero tracking scripts" },
                  { icon: Lock, title: "Local storage only", desc: "Data stays in your browser, nowhere else" },
                  { icon: Wifi, title: "Works offline", desc: "Full functionality without internet" },
                  { icon: Download, title: "Export anytime", desc: "Download JSON backups of all your data" },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-[#14B8A6]" /></div>
                      <div><p className="text-sm font-bold">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            <div className="relative">
              <FloatingCard delay={0.3} className="space-y-4">
                <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-[#14B8A6]" /><span className="font-extrabold">Privacy Report</span></div>
                <div className="space-y-3">
                  {[
                    { label: "Data sent to servers", value: "0 bytes" },
                    { label: "Tracking scripts", value: "None" },
                    { label: "Third-party cookies", value: "None" },
                    { label: "Analytics", value: "Disabled" },
                    { label: "Account required", value: "No" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-bold text-[#14B8A6]">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/20">
                  <Check className="h-4 w-4 text-[#14B8A6]" />
                  <span className="text-xs font-bold text-[#14B8A6]">Perfect Privacy Score</span>
                </div>
              </FloatingCard>
            </div>
          </div>
        </div>
      </Section>

      {/* Multi-Platform */}
      <Section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-bold text-[#14B8A6] mb-2 tracking-wide uppercase">Works Everywhere</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">One app, every device</h2>
          <p className="text-muted-foreground mt-4 leading-relaxed max-w-xl mx-auto">Axtora is a Progressive Web App (PWA) that works on any device with a browser.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {[
              { icon: Smartphone, title: "Mobile", desc: "Install on iOS & Android. Full app experience with offline support." },
              { icon: Globe, title: "Web", desc: "Use in any modern browser. Chrome, Safari, Firefox, Edge — all supported." },
              { icon: BarChart3, title: "Desktop", desc: "Full desktop experience with sidebar navigation and wide-screen charts." },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <FloatingCard key={item.title} delay={0.2 + i * 0.1} className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center mx-auto mb-4"><Icon className="h-6 w-6 text-[#14B8A6]" /></div>
                  <h3 className="text-base font-extrabold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </FloatingCard>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section className="py-20 sm:py-28 bg-muted/10 border-y border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-bold text-[#14B8A6] mb-2 tracking-wide uppercase">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Free. Forever.</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">No premium tiers, no hidden fees, no trial periods.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
            <PricingCard title="Free" price="$0" description="Everything you need" features={["Unlimited income sources", "Unlimited expense tracking", "Wishlist management", "Project & goal tracking", "35+ currencies", "Dark & light themes"]} delay={0.1} onCta={() => router.push("/signup")} />
            <PricingCard title="Free" price="$0" description="All features included" highlighted features={["Everything in Free", "Budget limits per category", "Data export & backup", "Offline access (PWA)", "Smart dashboard & charts", "No ads, ever"]} delay={0.2} onCta={() => router.push("/signup")} />
            <PricingCard title="Free" price="$0" description="No strings attached" features={["Everything in Free", "Privacy-first design", "Zero data collection", "No account required", "Cross-device support", "Regular updates"]} delay={0.3} onCta={() => router.push("/signup")} />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E]" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
            <div className="relative px-6 sm:px-12 py-14 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Ready to take control of your finances?</h2>
              <p className="text-white/80 mt-4 text-lg leading-relaxed max-w-xl mx-auto">Start tracking your income, expenses, and goals in minutes. No sign-up required.</p>
              <button onClick={() => router.push("/signup")} className="inline-flex items-center gap-2.5 mt-8 bg-white text-[#0D9488] px-8 py-3.5 rounded-2xl text-base font-bold transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg">
                Launch Axtora Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#14B8A6] flex items-center justify-center"><BarChart3 className="h-3.5 w-3.5 text-white" /></div>
              <span className="text-sm font-extrabold">Axtora</span>
              <span className="text-xs text-muted-foreground">v3.0.0</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => router.push("/signup")} className="text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors">Get Started</button>
              <a href="#features" className="text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors">Features</a>
              <span className="text-xs text-muted-foreground font-semibold">100% Client-Side</span>
            </div>
            <p className="text-xs text-muted-foreground">&copy; 2026 Axtora. Your data, your device.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
