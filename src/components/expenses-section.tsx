"use client"

import { useFinanceStore, type Expense } from "@/store/finance-store"
import {
  formatDate, getDateGroup, getCategoryInfo, EXPENSE_CATEGORIES, type ExpenseCategory,
} from "@/lib/finance-helpers"
import { useFormatCurrency } from "@/hooks/use-format-currency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { EmptyState } from "@/components/empty-state"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Receipt,
  Trash2,
  Pencil,
  Search,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Tag,
  MoreHorizontal,
  TrendingDown,
  Building2,
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  Copy,
  Repeat,
  ChevronRight,
  ChevronDown,
  PieChart as PieChartIcon,
  AlertCircle,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SortOption = "date" | "amount" | "category"
type TimePeriod = "thisWeek" | "thisMonth" | "lastMonth" | "allTime"

const SORT_LABELS: Record<SortOption, { label: string; icon: React.ElementType }> = {
  date: { label: "Date", icon: Calendar },
  amount: { label: "Amount", icon: DollarSign },
  category: { label: "Category", icon: Tag },
}

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "allTime", label: "All Time" },
]

const CATEGORY_HEX_COLORS: Record<ExpenseCategory, string> = {
  housing: "#ea580c",
  food: "#d97706",
  transport: "#0d9488",
  shopping: "#db2777",
  entertainment: "#9333ea",
  health: "#dc2626",
  education: "#7c3aed",
  bills: "#64748b",
  other: "#6b7280",
}

const paymentMethods: Record<string, { label: string; icon: React.ElementType }> = {
  cash: { label: "Cash", icon: Banknote },
  card: { label: "Card", icon: CreditCard },
  upi: { label: "UPI", icon: Smartphone },
  bank: { label: "Bank Transfer", icon: Building2 },
  other: { label: "Other", icon: Wallet },
}

function getTimePeriodRange(period: TimePeriod) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case "thisWeek": {
      const dayOfWeek = today.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const start = new Date(today.getTime() + mondayOffset * 86400000)
      const end = new Date(start.getTime() + 6 * 86400000)
      return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] }
    }
    case "thisMonth": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
      return { start, end }
    }
    case "lastMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0]
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0]
      return { start, end }
    }
    case "allTime": {
      return { start: "2000-01-01", end: "2099-12-31" }
    }
  }
}

/* ─── Custom Tooltip for Donut ─── */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  const fmt = useFormatCurrency()
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border bg-background px-3 py-1.5 shadow-sm text-xs">
      <span className="font-medium">{item.name}</span>: {fmt(item.value)}
    </div>
  )
}

export function ExpensesSection() {
  const expenses = useFinanceStore((s) => s.expenses)
  const deleteExpense = useFinanceStore((s) => s.deleteExpense)
  const duplicateExpense = useFinanceStore((s) => s.duplicateExpense)
  const budgetLimits = useFinanceStore((s) => s.budgetLimits)
  const incomeSources = useFinanceStore((s) => s.incomeSources)
  const fmt = useFormatCurrency()

  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">("all")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("thisMonth")
  const [showChart, setShowChart] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalIncome = useMemo(() => {
    return incomeSources.filter((s) => s.isActive).reduce((sum, s) => {
      switch (s.frequency) {
        case "weekly": return sum + s.amount * 4.33
        case "yearly": return sum + s.amount / 12
        case "monthly": return sum + s.amount
        case "one-time": return sum + s.amount
        default: return sum + s.amount
      }
    }, 0)
  }, [incomeSources])

  const expensesByCategory = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    const result: Record<ExpenseCategory, number> = { housing: 0, food: 0, transport: 0, shopping: 0, entertainment: 0, health: 0, education: 0, bills: 0, other: 0 }
    expenses.filter((e) => e.date >= monthStart).forEach((e) => { if (e.category in result) result[e.category] += e.amount })
    return result
  }, [expenses])

  // Filter by time period
  const periodFilteredExpenses = useMemo(() => {
    const { start, end } = getTimePeriodRange(timePeriod)
    return expenses.filter((e) => e.date >= start && e.date <= end)
  }, [expenses, timePeriod])

  const totalExpenses = periodFilteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const expenseCount = periodFilteredExpenses.length
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0

  // Daily average
  const dailyAverage = useMemo(() => {
    if (timePeriod === "allTime") return avgExpense
    const now = new Date()
    const { start } = getTimePeriodRange(timePeriod)
    const startDate = new Date(start)
    const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / 86400000))
    return totalExpenses / daysElapsed
  }, [timePeriod, totalExpenses])

  // Biggest expense
  const biggestExpense = useMemo(() => {
    if (periodFilteredExpenses.length === 0) return null
    return periodFilteredExpenses.reduce((max, e) => (e.amount > max.amount ? e : max), periodFilteredExpenses[0])
  }, [periodFilteredExpenses])

  // Apply search + category filter + sort on top of time period filter
  const filteredExpenses = useMemo(() => {
    let filtered = filterCategory === "all"
      ? periodFilteredExpenses
      : periodFilteredExpenses.filter((e) => e.category === filterCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) => e.name.toLowerCase().includes(q) || getCategoryInfo(e.category).label.toLowerCase().includes(q)
      )
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "amount":
          return b.amount - a.amount
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })
  }, [periodFilteredExpenses, filterCategory, searchQuery, sortBy])

  const groupedExpenses = useMemo(() => {
    if (sortBy !== "date") return null
    const groups: Record<string, typeof filteredExpenses> = { today: [], yesterday: [], thisWeek: [], earlier: [] }
    filteredExpenses.forEach((e) => { const group = getDateGroup(e.date); groups[group] = groups[group] || []; groups[group].push(e) })
    return groups
  }, [filteredExpenses, sortBy])

  const groupLabels: Record<string, string> = { today: "Today", yesterday: "Yesterday", thisWeek: "This Week", earlier: "Earlier" }

  // Donut chart data
  const chartData = useMemo(() => {
    const data: { name: string; value: number; color: string; category: ExpenseCategory }[] = []
    ;(Object.entries(expensesByCategory) as [ExpenseCategory, number][]).forEach(([cat, amount]) => {
      if (amount > 0) {
        data.push({
          name: getCategoryInfo(cat).label,
          value: Math.round(amount * 100) / 100,
          color: CATEGORY_HEX_COLORS[cat],
          category: cat,
        })
      }
    })
    return data.sort((a, b) => b.value - a.value)
  }, [expensesByCategory])

  // Category spending for budget warnings
  const categorySpending = useMemo(() => {
    const spending: Record<ExpenseCategory, number> = {
      housing: 0, food: 0, transport: 0, shopping: 0,
      entertainment: 0, health: 0, education: 0, bills: 0, other: 0,
    }
    periodFilteredExpenses.forEach((e) => { spending[e.category] += e.amount })
    return spending
  }, [periodFilteredExpenses])

  const getBudgetStatus = (category: ExpenseCategory): "ok" | "warning" | "over" => {
    const budget = budgetLimits.find((b) => b.category === category)
    if (!budget) return "ok"
    const spent = categorySpending[category]
    if (spent > budget.limit) return "over"
    if (spent > budget.limit * 0.8) return "warning"
    return "ok"
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            This month: <span className="font-bold text-[#EF4444]">{fmt(totalExpenses)}</span>
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {/* Enhanced Monthly Overview */}
      {expenses.length > 0 && (
        <div className="rounded-xl bg-[#EF4444]/5 dark:bg-[#EF4444]/10 border border-[#EF4444]/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-[#EF4444]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Monthly Spend</p>
                <p className="text-lg font-extrabold text-[#EF4444]">{fmt(totalExpenses)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">{expenseCount} transactions</p>
              <p className="text-[11px] text-muted-foreground font-semibold">Avg {fmt(avgExpense)}</p>
            </div>
          </div>

          {/* Daily Average & Biggest Expense */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg bg-white/50 dark:bg-white/5 border border-[#EF4444]/10 p-2.5">
              <p className="text-[11px] text-muted-foreground font-semibold">Daily Average</p>
              <p className="text-sm font-bold text-[#EF4444]">{fmt(dailyAverage)}</p>
            </div>
            <div className="rounded-lg bg-white/50 dark:bg-white/5 border border-[#EF4444]/10 p-2.5">
              <p className="text-[11px] text-muted-foreground font-semibold">Biggest Expense</p>
              <p className="text-sm font-bold text-[#EF4444] truncate">
                {biggestExpense ? biggestExpense.name : "—"}
              </p>
              {biggestExpense && (
                <p className="text-[11px] text-muted-foreground">{fmt(biggestExpense.amount)}</p>
              )}
            </div>
          </div>

          {totalIncome > 0 && (
            <>
              <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#EF4444]/60 rounded-l-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((totalExpenses / totalIncome) * 100))}%` }}
                />
                <div
                  className="h-full bg-[#14B8A6]/60 rounded-r-full transition-all"
                  style={{ width: `${Math.max(0, 100 - Math.min(100, Math.round((totalExpenses / totalIncome) * 100)))}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#EF4444]/60" />
                  <span className="text-[11px] text-muted-foreground">Spent {Math.round((totalExpenses / totalIncome) * 100)}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#14B8A6]/60" />
                  <span className="text-[11px] text-muted-foreground">Remaining {Math.max(0, 100 - Math.round((totalExpenses / totalIncome) * 100))}%</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Category Spending Chart (Collapsible) */}
      {chartData.length > 0 && (
        <Card className="overflow-hidden">
          <button
            onClick={() => setShowChart(!showChart)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold">Category Breakdown</span>
            </div>
            <motion.div animate={{ rotate: showChart ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showChart && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-4">
                    {/* Donut Chart */}
                    <div className="w-[120px] h-[120px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={50}
                            dataKey="value"
                            strokeWidth={2}
                          >
                            {chartData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} stroke="transparent" />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend - Top 3 */}
                    <div className="flex-1 space-y-2 min-w-0">
                      {chartData.slice(0, 3).map((item) => {
                        const pct = totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0
                        return (
                          <div key={item.category} className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-xs truncate flex-1">{item.name}</span>
                            <span className="text-xs font-bold shrink-0">{fmt(item.value)}</span>
                            <span className="text-[11px] text-muted-foreground shrink-0 w-8 text-right">{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Time Period Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1">
        {TIME_PERIODS.map((tp) => (
          <button
            key={tp.value}
            onClick={() => setTimePeriod(tp.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap",
              timePeriod === tp.value
                ? "bg-[#EF4444]/10 text-[#EF4444] shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {tp.label}
          </button>
        ))}
      </div>

      {/* Search + Filter + Sort */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs shrink-0">
              <Tag className="h-3 w-3" />
              <span className="hidden sm:inline">{filterCategory === "all" ? "All" : getCategoryInfo(filterCategory).label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setFilterCategory("all")}
              className={cn(filterCategory === "all" && "bg-accent")}
            >
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {EXPENSE_CATEGORIES.map((cat) => {
              const info = getCategoryInfo(cat)
              const Icon = info.icon
              return (
                <DropdownMenuItem
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(filterCategory === cat && "bg-accent")}
                >
                  <Icon className={cn("h-3.5 w-3.5 mr-2", info.color)} />
                  {info.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs shrink-0">
              <ArrowUpDown className="h-3 w-3" />
              <span className="hidden sm:inline">{SORT_LABELS[sortBy].label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.entries(SORT_LABELS) as [SortOption, typeof SORT_LABELS[SortOption]][]).map(
              ([key, { label, icon: Icon }]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={cn(sortBy === key && "bg-accent")}
                >
                  <Icon className="h-3.5 w-3.5 mr-2" />
                  {label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filter indicator */}
      {filterCategory !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Filtered by:</span>
          <button
            onClick={() => setFilterCategory("all")}
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
          >
            {getCategoryInfo(filterCategory).label}
            <span className="text-[#EF4444]/60 ml-0.5">✕</span>
          </button>
        </div>
      )}

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-7 w-7 text-[#EF4444]" />}
            title="No expenses recorded"
            description="Start tracking your spending by adding expenses. Categorize them to see where your money goes each month."
            action={
              <Button onClick={() => setShowAdd(true)} className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold">
                <Plus className="h-4 w-4 mr-1.5" />
                Add expense
              </Button>
            }
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                <Receipt className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-sm">No matches</h3>
              <p className="text-muted-foreground text-xs mt-1">Try a different search or filter</p>
            </CardContent>
          </Card>
        )
      ) : sortBy === "date" && groupedExpenses ? (
        /* Date-grouped view */
        <div className="space-y-4">
          {(["today", "yesterday", "thisWeek", "earlier"] as const).map((group) => {
            const items = groupedExpenses[group]
            if (!items || items.length === 0) return null
            return (
              <div key={group}>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {groupLabels[group]}
                </h3>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {items.map((expense) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        totalSpending={totalExpenses}
                        expanded={expandedId === expense.id}
                        onToggleExpand={() => setExpandedId(expandedId === expense.id ? null : expense.id)}
                        onEdit={setEditId}
                        onDelete={setDeleteId}
                        onDuplicate={(id) => {
                          duplicateExpense(id)
                          toast.success("Expense duplicated")
                        }}
                        budgetStatus={getBudgetStatus(expense.category)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Flat list view (sorted by amount or category) */
        <div className="space-y-1.5">
          <AnimatePresence>
            {filteredExpenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                totalSpending={totalExpenses}
                expanded={expandedId === expense.id}
                onToggleExpand={() => setExpandedId(expandedId === expense.id ? null : expense.id)}
                onEdit={setEditId}
                onDelete={setDeleteId}
                onDuplicate={(id) => {
                  duplicateExpense(id)
                  toast.success("Expense duplicated")
                }}
                budgetStatus={getBudgetStatus(expense.category)}
                showCategory={sortBy === "amount"}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialogs */}
      <AddExpenseDialog open={showAdd} onOpenChange={setShowAdd} />
      {editId && <EditExpenseDialog open={!!editId} onOpenChange={(open) => { if (!open) setEditId(null) }} expenseId={editId} />}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteExpense(deleteId)
                  toast.success("Expense deleted")
                  setDeleteId(null)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Expandable Expense Row ─── */

function ExpenseRow({
  expense,
  totalSpending,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onDuplicate,
  budgetStatus,
  showCategory = false,
}: {
  expense: Expense
  totalSpending: number
  expanded: boolean
  onToggleExpand: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  budgetStatus: "ok" | "warning" | "over"
  showCategory?: boolean
}) {
  const info = getCategoryInfo(expense.category)
  const Icon = info.icon
  const fmt = useFormatCurrency()
  const pm = expense.paymentMethod ? paymentMethods[expense.paymentMethod] : null
  const PmIcon = pm?.icon
  const sharePct = totalSpending > 0 ? Math.round((expense.amount / totalSpending) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div
        className={cn(
          "rounded-xl bg-card border border-border/50 transition-all group cursor-pointer",
          expanded && "border-red-200/60 dark:border-red-800/30"
        )}
        onClick={onToggleExpand}
      >
        {/* Main Row */}
        <div className="flex items-center gap-3 p-3">
          <div className="relative">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", info.bgColor, info.darkBgColor)}>
              <Icon className={cn("h-4 w-4", info.color)} />
            </div>
            {/* Budget Warning Badge */}
            {budgetStatus === "warning" && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-card" />
            )}
            {budgetStatus === "over" && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold truncate">{expense.name}</p>
              {expense.isRecurring && (
                <Repeat className="h-3 w-3 text-muted-foreground shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {info.label} · {formatDate(expense.date)}
            </p>
          </div>
          <span className="text-sm font-bold shrink-0">{fmt(expense.amount)}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 hover:bg-muted rounded-md transition-colors shrink-0 opacity-60 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(expense.id) }}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(expense.id) }}>
                <Copy className="h-3.5 w-3.5 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(expense.id) }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
              expanded && "rotate-90"
            )}
          />
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/40 mt-0 pt-3">
                {/* Date & Time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(expense.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                </div>

                {/* Payment Method */}
                {pm && PmIcon && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <PmIcon className="h-3.5 w-3.5" />
                    <span>{pm.label}</span>
                  </div>
                )}

                {/* Notes */}
                {expense.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    {expense.notes}
                  </div>
                )}

                {/* Recurring Badge */}
                {expense.isRecurring && (
                  <Badge variant="secondary" className="gap-1 text-[10px] h-5">
                    <Repeat className="h-2.5 w-2.5" />
                    Recurring
                  </Badge>
                )}

                {/* Category details */}
                <div className="flex items-center gap-2">
                  <div className={cn("h-5 w-5 rounded flex items-center justify-center", info.bgColor, info.darkBgColor)}>
                    <Icon className={cn("h-3 w-3", info.color)} />
                  </div>
                  <span className="text-xs font-bold">{info.label}</span>
                  {budgetStatus !== "ok" && (
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                      budgetStatus === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      budgetStatus === "over" && "bg-[#EF4444]/10 text-[#EF4444]"
                    )}>
                      <AlertCircle className="h-2.5 w-2.5" />
                      {budgetStatus === "warning" ? "Over 80% budget" : "Over budget"}
                    </div>
                  )}
                </div>

                {/* Share of Total Spending */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Share of total spending</span>
                    <span className="font-bold">{sharePct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#EF4444]/60 rounded-full transition-all"
                      style={{ width: `${Math.min(100, sharePct)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 flex-1"
                    onClick={(e) => { e.stopPropagation(); onEdit(expense.id) }}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 flex-1"
                    onClick={(e) => { e.stopPropagation(); onDuplicate(expense.id) }}
                  >
                    <Copy className="h-3 w-3" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    onClick={(e) => { e.stopPropagation(); onDelete(expense.id) }}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
