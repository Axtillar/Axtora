"use client"

import { useFinanceStore } from "@/store/finance-store"
import { useAuthStore } from "@/store/auth-store"
import {
  getCategoryInfo,
  EXPENSE_CATEGORIES,
} from "@/lib/finance-helpers"
import { useFormatCurrency } from "@/hooks/use-format-currency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Target,
  Wallet,
  Receipt,
  PiggyBank,
  LayoutDashboard,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useMemo, useCallback, useEffect } from "react"

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { WelcomePopup } from "@/components/welcome-popup"
import { toast } from "sonner"
import { ChartErrorBoundary } from "@/components/chart-error-boundary"

interface ChartDataPoint {
  month: string
  Income: number
  Expenses: number
}

function generateChartData(currentIncome: number, currentExpenses: number) {
  const months: ChartDataPoint[] = []
  const now = new Date()
  // Use deterministic values to avoid hydration mismatch between SSR and client.
  const baseIncome = 5500
  const baseExpenses = 2200
  const incomeOffsets = [600, 800, 400, 1100, 700, 0]
  const expenseOffsets = [300, 500, 200, 700, 400, 0]
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = date.toLocaleDateString("en-US", { month: "short" })
    const idx = 5 - i
    if (i === 0) {
      months.push({
        month: label,
        Income: Math.round(currentIncome),
        Expenses: Math.round(currentExpenses),
      })
    } else {
      months.push({
        month: label,
        Income: Math.round(baseIncome + incomeOffsets[idx]),
        Expenses: Math.round(baseExpenses + expenseOffsets[idx]),
      })
    }
  }
  return months
}

// Module-level flag to show backup reminder only once per session
let backupReminderShown = false

export function Dashboard() {
  const incomeSources = useFinanceStore((s) => s.incomeSources)
  const expenses = useFinanceStore((s) => s.expenses)
  const projects = useFinanceStore((s) => s.projects)
  const wishlistItems = useFinanceStore((s) => s.wishlistItems)
  const settings = useFinanceStore((s) => s.settings)
  const setActiveSection = useFinanceStore((s) => s.setActiveSection)
  const fmt = useFormatCurrency()
  const userName = useAuthStore((s) => s.user?.name)

  // Auto-backup reminder
  useEffect(() => {
    if (backupReminderShown) return
    const hasData = incomeSources.length > 0 || expenses.length > 0
    if (!hasData) return

    const lastBackup = settings.lastBackupDate
    let shouldRemind = false
    if (!lastBackup) {
      shouldRemind = true
    } else {
      const daysSinceBackup = (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceBackup > 7) shouldRemind = true
    }

    if (shouldRemind) {
      backupReminderShown = true
      const timer = setTimeout(() => {
        toast.info("Haven't backed up in a while. Export a backup from Settings → Backup & Restore")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [incomeSources, expenses, settings.lastBackupDate])

  // Compute derived values with useMemo using raw data as dependencies
  const totalIncome = useMemo(() => {
    return incomeSources
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        switch (s.frequency) {
          case "weekly": return sum + s.amount * 4.33
          case "yearly": return sum + s.amount / 12
          case "monthly": return sum + s.amount
          case "one-time": return sum + s.amount
          default: return sum + s.amount
        }
      }, 0)
  }, [incomeSources])

  const totalExpenses = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    return expenses.filter((e) => e.date >= monthStart).reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  const expensesByCategory = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    const result: Record<string, number> = { housing: 0, food: 0, transport: 0, shopping: 0, entertainment: 0, health: 0, education: 0, bills: 0, other: 0 }
    expenses.filter((e) => e.date >= monthStart).forEach((e) => { if (e.category in result) result[e.category] += e.amount })
    return result
  }, [expenses])

  const availableBalance = totalIncome - totalExpenses
  const wishlistTotal = useMemo(() => wishlistItems.filter((w) => !w.purchased).reduce((sum, w) => sum + w.price, 0), [wishlistItems])
  const wishlistRemaining = useMemo(() => wishlistItems.filter((w) => !w.purchased).length, [wishlistItems])

  const hasData = incomeSources.length > 0 || expenses.length > 0

  const chartData = useMemo(
    () => generateChartData(totalIncome, totalExpenses),
    [totalIncome, totalExpenses]
  )

  const topCategories = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => ({
      category: cat,
      amount: expensesByCategory[cat] || 0,
      info: getCategoryInfo(cat),
    }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
  }, [expensesByCategory])

  const activeProjects = useMemo(() => {
    return projects
      .map((p) => {
        const progress = p.items.length === 0 ? 0 : Math.round((p.items.filter((i) => i.completed).length / p.items.length) * 100)
        return { ...p, progress }
      })
      .filter((p) => p.status !== "completed")
      .slice(0, 3)
  }, [projects])

  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0

  const isBalancePositive = availableBalance >= 0

  // Memoize Recharts props to prevent unnecessary re-renders
  const tooltipContentStyle = useMemo(() => ({
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    fontSize: "11px",
  }), [])

  const tooltipFormatter = useCallback((value: number) => fmt(value), [fmt])

  // Empty dashboard state — show onboarding when user has no data
  if (!hasData) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5 font-semibold">
            Your finances at a glance
          </p>
        </div>

        <EmptyState
          icon={<LayoutDashboard className="h-7 w-7 text-[#14B8A6]" />}
          title="Your financial dashboard"
          description="Start by adding your income sources and expenses. Axtora will help you track everything — budgets, savings, wishlists, and projects."
          action={
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setActiveSection("income")}
                className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white font-bold"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add income
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveSection("expenses")}
                className="font-bold"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add expense
              </Button>
            </div>
          }
        />

        {/* Quick Actions still visible */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Wallet, label: "Income", section: "income" as const, color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10" },
            { icon: Receipt, label: "Expense", section: "expenses" as const, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
            { icon: Target, label: "Project", section: "projects" as const, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
            { icon: Heart, label: "Wishlist", section: "wishlist" as const, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-100 dark:bg-pink-900/30" },
          ].map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => setActiveSection(action.section)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-colors active:scale-95"
              >
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", action.bg)}>
                  <Icon className={cn("h-4 w-4", action.color)} />
                </div>
                <span className="text-xs font-bold text-muted-foreground">{action.label}</span>
              </button>
            )
          })}
        </div>

        <WelcomePopup />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">
          Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground text-xs mt-0.5 font-semibold">
          Your finances at a glance
        </p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card className={cn(
          "border-0 shadow-md bg-card"
        )}>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-bold">
              Available Balance
            </p>
            <motion.p
              className={cn(
                "text-4xl font-extrabold tracking-tight mt-1",
                isBalancePositive ? "text-foreground" : "text-red-600 dark:text-red-400"
              )}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {fmt(availableBalance)}
            </motion.p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#14B8A6]" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold">Income</p>
                  <p className="text-sm font-bold text-[#14B8A6]">
                    {fmt(totalIncome)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                  <ArrowDownRight className="h-3.5 w-3.5 text-[#EF4444]" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold">Expenses</p>
                  <p className="text-sm font-bold text-[#EF4444]">
                    {fmt(totalExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Wallet, label: "Income", section: "income" as const, color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10" },
            { icon: Receipt, label: "Expense", section: "expenses" as const, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
            { icon: Target, label: "Project", section: "projects" as const, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
            { icon: Heart, label: "Wishlist", section: "wishlist" as const, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-100 dark:bg-pink-900/30" },
          ].map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => setActiveSection(action.section)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-colors active:scale-95"
              >
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", action.bg)}>
                  <Icon className={cn("h-4 w-4", action.color)} />
                </div>
                <span className="text-xs font-bold text-muted-foreground">{action.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Income vs Expenses Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-extrabold">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-48 lg:h-56">
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => fmt(v).replace(/\.00$/, "")}
                      width={50}
                    />
                    <Tooltip
                      formatter={tooltipFormatter}
                      contentStyle={tooltipContentStyle}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar
                      dataKey="Income"
                      fill="#14B8A6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="Expenses"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Expense Categories */}
      {topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-extrabold">Top Spending</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                {topCategories.map(({ category, amount, info }) => {
                  const Icon = info.icon
                  const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
                  return (
                    <div
                      key={category}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                          info.bgColor,
                          info.darkBgColor
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", info.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-bold truncate">{info.label}</span>
                          <span className="text-sm font-bold shrink-0 ml-2">{fmt(amount)}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", info.color.replace("text-", "bg-").replace("dark:", ""))}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Projects Quick View */}
      {activeProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-[#14B8A6]" />
                  Active Projects
                </CardTitle>
                <button
                  onClick={() => setActiveSection("projects")}
                  className="text-[11px] text-[#14B8A6] font-bold hover:underline"
                >
                  See all
                </button>
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-2.5">
              {activeProjects.map((project) => (
                <div key={project.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold truncate">{project.name}</span>
                    <span className={cn(
                      "text-[11px] tabular-nums font-bold",
                      project.progress === 100
                        ? "text-[#14B8A6]"
                        : "text-muted-foreground"
                    )}>
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        project.progress === 100 ? "bg-[#14B8A6]" : "bg-[#14B8A6]/60"
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Wishlist + Savings Rate - side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wishlist Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                  Wishlist
                </CardTitle>
                <button
                  onClick={() => setActiveSection("wishlist")}
                  className="text-[11px] text-[#14B8A6] font-bold hover:underline"
                >
                  See all
                </button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-lg font-extrabold">{fmt(wishlistTotal)}</p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                {wishlistRemaining} items remaining
              </p>
              {availableBalance >= wishlistTotal && wishlistTotal > 0 && (
                <p className="text-[11px] text-[#14B8A6] font-bold mt-1">
                  You can afford it all!
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Rate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <PiggyBank className="h-3.5 w-3.5 text-[#14B8A6]" />
                Savings Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <p
                  className={cn(
                    "text-lg font-extrabold",
                    savingsRate >= 20
                      ? "text-[#14B8A6]"
                      : savingsRate >= 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-[#EF4444]"
                  )}
                >
                  {savingsRate}%
                </p>
              </div>
              <Progress value={Math.max(0, savingsRate)} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground mt-2">
                {savingsRate >= 30
                  ? "Excellent savings habit!"
                  : savingsRate >= 20
                  ? "On track with savings."
                  : savingsRate >= 10
                  ? "Try saving a bit more."
                  : savingsRate >= 0
                  ? "Look for areas to cut back."
                  : "Spending exceeds income."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <WelcomePopup />
    </div>
  )
}
