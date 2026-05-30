"use client"

import { useFinanceStore, type IncomeSource } from "@/store/finance-store"
import { useFormatCurrency } from "@/hooks/use-format-currency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AddIncomeDialog } from "@/components/add-income-dialog"
import { EmptyState } from "@/components/empty-state"
import { EditIncomeDialog } from "@/components/edit-income-dialog"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Briefcase, DollarSign, TrendingUp, Building2, Laptop, Gift, PiggyBank, Landmark,
  Trash2, Wallet, Pencil, Search, MoreHorizontal, ArrowUpDown, ArrowUpRight,
  Calendar, Clock, Pause, Play, Power, StickyNote, ChevronRight, BarChart3,
  Repeat,
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ElementType> = {
  Briefcase, DollarSign, TrendingUp, Building2, Laptop, Gift, PiggyBank, Landmark,
}

type SortOption = "name" | "amount" | "frequency" | "nextPay"
type FilterOption = "all" | "active" | "paused" | "monthly" | "weekly" | "yearly" | "one-time"

const SORT_LABELS: Record<SortOption, { label: string; icon: React.ElementType }> = {
  name: { label: "Name", icon: Search },
  amount: { label: "Amount", icon: DollarSign },
  frequency: { label: "Frequency", icon: ArrowUpDown },
  nextPay: { label: "Next pay", icon: Calendar },
}

const FILTER_LABELS: Record<FilterOption, { label: string; icon: React.ElementType }> = {
  all: { label: "All", icon: Wallet },
  active: { label: "Active", icon: Play },
  paused: { label: "Paused", icon: Pause },
  monthly: { label: "Monthly", icon: Repeat },
  weekly: { label: "Weekly", icon: Repeat },
  yearly: { label: "Yearly", icon: Repeat },
  "one-time": { label: "One-time", icon: DollarSign },
}

const frequencyOrder: Record<string, number> = { monthly: 0, weekly: 1, yearly: 2, "one-time": 3 }

const frequencyLabel: Record<string, string> = {
  monthly: "Monthly",
  weekly: "Weekly",
  yearly: "Yearly",
  "one-time": "One-time",
}

function toMonthly(amount: number, freq: IncomeSource["frequency"]): number {
  switch (freq) {
    case "weekly": return amount * 4.33
    case "yearly": return amount / 12
    case "monthly": return amount
    case "one-time": return amount
    default: return amount
  }
}

function toYearly(amount: number, freq: IncomeSource["frequency"]): number {
  switch (freq) {
    case "weekly": return amount * 52
    case "monthly": return amount * 12
    case "yearly": return amount
    case "one-time": return amount
    default: return amount
  }
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(dateStr)
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.ceil((targetDate.getTime() - today.getTime()) / 86400000)
}

function formatNextPay(dateStr: string): string {
  const d = daysUntil(dateStr)
  if (d < 0) return "Overdue"
  if (d === 0) return "Today"
  if (d === 1) return "Tomorrow"
  if (d <= 7) return `In ${d} days`
  if (d <= 14) return `In ${Math.round(d / 7)} weeks`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function IncomeSection() {
  const incomeSources = useFinanceStore((s) => s.incomeSources)
  const deleteIncomeSource = useFinanceStore((s) => s.deleteIncomeSource)
  const toggleIncomeActive = useFinanceStore((s) => s.toggleIncomeActive)
  const fmt = useFormatCurrency()
  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("amount")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalMonthly = useMemo(() => {
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
  const activeSources = useMemo(() => incomeSources.filter((s) => s.isActive), [incomeSources])
  const pausedSources = useMemo(() => incomeSources.filter((s) => !s.isActive), [incomeSources])
  const totalYearly = useMemo(() => activeSources.reduce((s, src) => s + toYearly(src.amount, src.frequency), 0), [activeSources])
  const biggestSource = useMemo(() => activeSources.length > 0
    ? activeSources.reduce((max, src) => toMonthly(src.amount, src.frequency) > toMonthly(max.amount, max.frequency) ? src : max, activeSources[0])
    : null, [activeSources])

  const filteredSources = useMemo(() => {
    let filtered = incomeSources
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q))
    }
    switch (filterBy) {
      case "active": filtered = filtered.filter((s) => s.isActive); break
      case "paused": filtered = filtered.filter((s) => !s.isActive); break
      case "monthly": filtered = filtered.filter((s) => s.frequency === "monthly"); break
      case "weekly": filtered = filtered.filter((s) => s.frequency === "weekly"); break
      case "yearly": filtered = filtered.filter((s) => s.frequency === "yearly"); break
      case "one-time": filtered = filtered.filter((s) => s.frequency === "one-time"); break
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name)
        case "amount": return toMonthly(b.amount, b.frequency) - toMonthly(a.amount, a.frequency)
        case "frequency": return (frequencyOrder[a.frequency] ?? 4) - (frequencyOrder[b.frequency] ?? 4)
        case "nextPay": {
          if (!a.nextPayDate && !b.nextPayDate) return 0
          if (!a.nextPayDate) return 1
          if (!b.nextPayDate) return -1
          return new Date(a.nextPayDate).getTime() - new Date(b.nextPayDate).getTime()
        }
        default: return 0
      }
    })
  }, [incomeSources, searchQuery, sortBy, filterBy])

  // Upcoming pay dates
  const upcomingPays = useMemo(() => {
    return activeSources
      .filter((s) => s.nextPayDate && daysUntil(s.nextPayDate) >= 0)
      .sort((a, b) => new Date(a.nextPayDate!).getTime() - new Date(b.nextPayDate!).getTime())
      .slice(0, 3)
  }, [activeSources])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Income</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Monthly: <span className="font-bold text-[#14B8A6]">{fmt(totalMonthly)}</span>
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {/* Main Overview Card */}
      {incomeSources.length > 0 && (
        <div className="rounded-xl bg-[#14B8A6]/5 dark:bg-[#14B8A6]/10 border border-[#14B8A6]/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Monthly Income</p>
                <p className="text-lg font-extrabold text-[#14B8A6]">{fmt(totalMonthly)}</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[11px] text-muted-foreground">{activeSources.length} active · {pausedSources.length} paused</p>
              <p className="text-[11px] text-muted-foreground">~{fmt(totalYearly)}/yr</p>
            </div>
          </div>

          {/* Source breakdown mini-bar */}
          {activeSources.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                {activeSources.map((source) => {
                  const monthly = toMonthly(source.amount, source.frequency)
                  const pct = totalMonthly > 0 ? (monthly / totalMonthly) * 100 : 0
                  const Icon = iconMap[source.icon] || DollarSign
                  // Cycle through teal/violet/sky shades
                  const colors = [
                    "bg-teal-500",
                    "bg-teal-500",
                    "bg-cyan-500",
                    "bg-green-500",
                    "bg-lime-500",
                  ]
                  const idx = activeSources.indexOf(source) % colors.length
                  return (
                    <div
                      key={source.id}
                      className={cn("h-full rounded-full transition-all", colors[idx])}
                      style={{ width: `${pct}%` }}
                      title={`${source.name}: ${fmt(monthly)}`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {activeSources.slice(0, 4).map((source, i) => {
                  const monthly = toMonthly(source.amount, source.frequency)
                  const Icon = iconMap[source.icon] || DollarSign
                  const colors = [
                    "bg-teal-500",
                    "bg-teal-500",
                    "bg-cyan-500",
                    "bg-green-500",
                  ]
                  return (
                    <div key={source.id} className="flex items-center gap-1.5">
                      <div className={cn("h-1.5 w-1.5 rounded-full", colors[i % colors.length])} />
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{source.name}</span>
                      <span className="text-[11px] font-bold">{fmt(monthly)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Pay Schedule */}
      {upcomingPays.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Clock className="h-3.5 w-3.5 text-[#14B8A6]" />
              <span className="text-xs font-bold">Upcoming Pay</span>
            </div>
            <div className="space-y-2">
              {upcomingPays.map((source) => {
                const Icon = iconMap[source.icon] || DollarSign
                const d = daysUntil(source.nextPayDate!)
                const urgency = d <= 1 ? "text-[#14B8A6]" : d <= 3 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                return (
                  <div key={source.id} className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-bold flex-1 truncate">{source.name}</span>
                    <span className="text-sm font-bold shrink-0">{fmt(source.amount)}</span>
                    <span className={cn("text-[11px] shrink-0", urgency)}>{formatNextPay(source.nextPayDate!)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Filter + Sort */}
      {incomeSources.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search income..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs shrink-0">
                <FilterLabels icon={FILTER_LABELS[filterBy].icon} />
                <span className="hidden sm:inline">{FILTER_LABELS[filterBy].label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.entries(FILTER_LABELS) as [FilterOption, typeof FILTER_LABELS[FilterOption]][]).map(
                ([key, { label, icon: Icon }]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setFilterBy(key)}
                    className={cn(filterBy === key && "bg-accent")}
                  >
                    <Icon className="h-3.5 w-3.5 mr-2" />
                    {label}
                  </DropdownMenuItem>
                )
              )}
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
      )}

      {/* Active filter indicator */}
      {filterBy !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Filtered by:</span>
          <button
            onClick={() => setFilterBy("all")}
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] hover:bg-[#14B8A6]/20 transition-colors"
          >
            {FILTER_LABELS[filterBy].label}
            <span className="text-[#14B8A6]/60 ml-0.5">✕</span>
          </button>
        </div>
      )}

      {/* Income List */}
      {incomeSources.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-7 w-7 text-[#14B8A6]" />}
          title="No income sources yet"
          description="Add your salary, freelance work, investments, or any other income to start tracking your finances."
          action={
            <Button onClick={() => setShowAdd(true)} className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white font-bold">
              <Plus className="h-4 w-4 mr-1.5" />
              Add income source
            </Button>
          }
        />
      ) : filteredSources.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-sm">No matches</h3>
            <p className="text-muted-foreground text-xs mt-1">Try a different filter or search</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence>
            {filteredSources.map((source) => {
              const Icon = iconMap[source.icon] || DollarSign
              const monthly = toMonthly(source.amount, source.frequency)
              const isExpanded = expandedId === source.id
              const percentage = totalMonthly > 0 && source.isActive
                ? Math.round((monthly / totalMonthly) * 100)
                : 0

              return (
                <motion.div key={source.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}>
                  <div
                    className={cn(
                      "rounded-xl bg-card border transition-all group",
                      !source.isActive
                        ? "border-border/30 opacity-60"
                        : "border-border/50 hover:border-border",
                    )}
                  >
                    {/* Main row - clickable to expand */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : source.id)}
                      className="flex items-center gap-3 p-3 w-full text-left"
                    >
                      <div className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                        source.isActive ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Icon className={cn("h-4 w-4", source.isActive ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={cn("text-sm font-bold truncate", !source.isActive && "text-muted-foreground")}>{source.name}</p>
                          {!source.isActive && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">Paused</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">{frequencyLabel[source.frequency]}</span>
                          {source.nextPayDate && source.isActive && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatNextPay(source.nextPayDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-bold", !source.isActive && "text-muted-foreground")}>{fmt(source.amount)}</p>
                        {source.frequency !== "monthly" && (
                          <p className="text-[11px] text-muted-foreground">
                            ≈ {fmt(monthly)}/mo
                          </p>
                        )}
                      </div>
                      {source.isActive && totalMonthly > 0 && (
                        <span className="text-[11px] text-muted-foreground font-bold shrink-0">{percentage}%</span>
                      )}
                      <ChevronRight className={cn(
                        "h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/30">
                            {/* Income share bar */}
                            {source.isActive && totalMonthly > 0 && (
                              <div className="pt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] text-muted-foreground">Share of total income</span>
                                  <span className="text-[11px] font-bold">{percentage}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                                </div>
                              </div>
                            )}

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div className="bg-muted/50 rounded-lg px-2.5 py-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly</p>
                                <p className="text-sm font-bold mt-0.5">{fmt(monthly)}</p>
                              </div>
                              <div className="bg-muted/50 rounded-lg px-2.5 py-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Yearly</p>
                                <p className="text-sm font-bold mt-0.5">{fmt(toYearly(source.amount, source.frequency))}</p>
                              </div>
                            </div>

                            {/* Notes */}
                            {source.notes && (
                              <div className="flex items-start gap-2 pt-1">
                                <StickyNote className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                <p className="text-[11px] text-muted-foreground font-medium">{source.notes}</p>
                              </div>
                            )}

                            {/* Next pay detail */}
                            {source.nextPayDate && (
                              <div className="flex items-center gap-2 pt-1">
                                <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-[11px] text-muted-foreground">
                                  Next pay: {new Date(source.nextPayDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </span>
                              </div>
                            )}

                            {/* Actions row */}
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] gap-1.5 flex-1"
                                onClick={() => setEditId(source.id)}
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn("h-7 text-[11px] gap-1.5 flex-1", source.isActive ? "" : "border-[#14B8A6]/30 text-[#14B8A6]")}
                                onClick={() => {
                                  toggleIncomeActive(source.id)
                                  toast.success(source.isActive ? "Income paused" : "Income reactivated")
                                }}
                              >
                                {source.isActive ? (
                                  <><Pause className="h-3 w-3" /> Pause</>
                                ) : (
                                  <><Play className="h-3 w-3" /> Resume</>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50"
                                onClick={() => setDeleteId(source.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Dialogs */}
      <AddIncomeDialog open={showAdd} onOpenChange={setShowAdd} />
      {editId && <EditIncomeDialog open={!!editId} onOpenChange={(open) => { if (!open) setEditId(null) }} incomeId={editId} />}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Source</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This income will no longer be tracked.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteIncomeSource(deleteId)
                  toast.success("Income source deleted")
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

/* Helper - just renders an icon */
function FilterLabels({ icon: Icon }: { icon: React.ElementType }) {
  return <Icon className="h-3 w-3" />
}
