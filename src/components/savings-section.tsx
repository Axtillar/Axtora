"use client"

import { useFinanceStore } from "@/store/finance-store"
import {
  getCategoryInfo,
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/finance-helpers"
import { useFormatCurrency } from "@/hooks/use-format-currency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PiggyBank, AlertTriangle, CheckCircle2, TrendingDown, Pencil, Trash2, MoreHorizontal,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SavingsSection() {
  const incomeSources = useFinanceStore((s) => s.incomeSources)
  const expenses = useFinanceStore((s) => s.expenses)
  const budgetLimits = useFinanceStore((s) => s.budgetLimits)
  const setBudgetLimit = useFinanceStore((s) => s.setBudgetLimit)
  const deleteBudgetLimit = useFinanceStore((s) => s.deleteBudgetLimit)
  const fmt = useFormatCurrency()

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

  const totalExpenses = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    return expenses.filter((e) => e.date >= monthStart).reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  const expensesByCategory = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    const result: Record<ExpenseCategory, number> = { housing: 0, food: 0, transport: 0, shopping: 0, entertainment: 0, health: 0, education: 0, bills: 0, other: 0 }
    expenses.filter((e) => e.date >= monthStart).forEach((e) => { if (e.category in result) result[e.category] += e.amount })
    return result
  }, [expenses])

  const moneyLeft = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((moneyLeft / totalIncome) * 100) : 0

  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [editBudgetCategory, setEditBudgetCategory] = useState<ExpenseCategory | null>(null)
  const [deleteBudgetCategory, setDeleteBudgetCategory] = useState<ExpenseCategory | null>(null)
  const [budgetCategory, setBudgetCategory] = useState<ExpenseCategory>("food")
  const [budgetAmount, setBudgetAmount] = useState("")

  const categoriesWithoutBudget = EXPENSE_CATEGORIES.filter(
    (cat) => !budgetLimits.find((b) => b.category === cat)
  )

  const budgetStatus = useMemo(() => {
    return budgetLimits.map((b) => {
      const spent = expensesByCategory[b.category]
      const percent = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0
      const status =
        percent >= 100 ? "over" : percent >= 80 ? "near" : "good"
      return { ...b, spent, percent, status }
    })
  }, [budgetLimits, expensesByCategory])

  const tip = useMemo(() => {
    if (savingsRate >= 30) return "Excellent! You're saving a healthy portion of your income."
    if (savingsRate >= 20) return "Great job! You're on track with your savings."
    if (savingsRate >= 10) return "Decent start. Try to save a bit more each month."
    if (savingsRate >= 0) return "Consider looking for areas to cut back on spending."
    return "You're spending more than you earn. Time to review your budget."
  }, [savingsRate])

  const handleEditBudget = (category: ExpenseCategory) => {
    const existing = budgetLimits.find((b) => b.category === category)
    if (existing) {
      setBudgetAmount(existing.limit.toString())
    }
    setEditBudgetCategory(category)
  }

  const handleDeleteBudget = (category: ExpenseCategory) => {
    deleteBudgetLimit(category)
    setDeleteBudgetCategory(null)
    toast.success("Budget limit removed")
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Savings & Budget
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Savings rate: <span className={cn(
              "font-bold",
              savingsRate >= 20 ? "text-[#14B8A6]" : savingsRate >= 0 ? "text-amber-600 dark:text-amber-400" : "text-[#EF4444]"
            )}>{savingsRate}%</span>
          </p>
        </div>
        {categoriesWithoutBudget.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setShowBudgetDialog(true)} className="gap-1.5 h-8 text-xs">
            <PiggyBank className="h-3.5 w-3.5" />
            Add Budget
          </Button>
        )}
      </div>

      {/* Money Left Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-bold">
              Money Left This Month
            </p>
            <p
              className={cn(
                "text-3xl lg:text-4xl font-extrabold tracking-tight mt-1",
                moneyLeft >= 0
                  ? "text-[#14B8A6]"
                  : "text-[#EF4444]"
              )}
            >
              {fmt(moneyLeft)}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground font-semibold">Savings rate</span>
                <span
                  className={cn(
                    "text-xs font-extrabold",
                    savingsRate >= 20
                      ? "text-[#14B8A6]"
                      : savingsRate >= 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-[#EF4444]"
                  )}
                >
                  {savingsRate}%
                </span>
              </div>
              <Progress value={Math.max(0, Math.min(100, savingsRate))} className="h-2.5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tip Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            {savingsRate >= 20 ? (
              <CheckCircle2 className="h-5 w-5 text-[#14B8A6] shrink-0 mt-0.5" />
            ) : savingsRate >= 0 ? (
              <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-[#EF4444] shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-muted-foreground">{tip}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Limits */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-extrabold">Budget Limits</CardTitle>
              {categoriesWithoutBudget.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBudgetDialog(true)}
                  className="text-xs"
                >
                  Set Budget
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4 space-y-4">
            {budgetLimits.length === 0 && totalExpenses === 0 ? (
              <EmptyState
                icon={<PiggyBank className="h-7 w-7 text-[#14B8A6]" />}
                title="Start tracking your savings"
                description="Set budget limits for each expense category and monitor your savings rate over time. Add some income and expenses first to see your savings picture."
              />
            ) : budgetStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No budgets set yet. Start by setting a budget for a category.
              </p>
            ) : (
              budgetStatus.map((budget) => {
                const info = getCategoryInfo(budget.category)
                const Icon = info.icon
                return (
                  <div key={budget.category} className="space-y-1.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", info.color)} />
                        <span className="text-sm font-bold">{info.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          <span
                            className={cn(
                              "font-bold",
                              budget.status === "over"
                                ? "text-[#EF4444]"
                                : budget.status === "near"
                                ? "text-amber-600 dark:text-amber-400"
                                : ""
                            )}
                          >
                            {fmt(budget.spent)}
                          </span>
                          {" / "}
                          {fmt(budget.limit)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-muted rounded transition-colors opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditBudget(budget.category)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit limit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteBudgetCategory(budget.category)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress
                        value={Math.min(100, budget.percent)}
                        className={cn(
                          "h-2",
                          budget.status === "over" && "[&>div]:bg-red-500",
                          budget.status === "near" && "[&>div]:bg-amber-500"
                        )}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Budget Dialog */}
      <BudgetDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
        categories={categoriesWithoutBudget}
        onSet={(category, limit) => {
          setBudgetLimit(category, limit)
          toast.success(`Budget set for ${getCategoryInfo(category).label}`)
        }}
      />

      {/* Edit Budget Dialog */}
      {editBudgetCategory && (
        <EditBudgetDialog
          open={!!editBudgetCategory}
          onOpenChange={(open) => { if (!open) setEditBudgetCategory(null) }}
          category={editBudgetCategory}
          currentLimit={budgetLimits.find((b) => b.category === editBudgetCategory)?.limit || 0}
          onSave={(category, limit) => {
            setBudgetLimit(category, limit)
            setEditBudgetCategory(null)
            toast.success("Budget updated")
          }}
        />
      )}

      {/* Delete Budget Confirmation */}
      <AlertDialog open={!!deleteBudgetCategory} onOpenChange={() => setDeleteBudgetCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the budget limit for {deleteBudgetCategory ? getCategoryInfo(deleteBudgetCategory).label : "this category"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteBudgetCategory) {
                  handleDeleteBudget(deleteBudgetCategory)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Budget Dialog (Add new) ─── */

function BudgetDialog({
  open,
  onOpenChange,
  categories,
  onSet,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: ExpenseCategory[]
  onSet: (category: ExpenseCategory, limit: number) => void
}) {
  const isMobile = useIsMobile()
  const [category, setCategory] = useState<ExpenseCategory>(categories[0] || "food")
  const [amount, setAmount] = useState("")

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => {
              const info = getCategoryInfo(cat)
              return (
                <SelectItem key={cat} value={cat}>
                  {info.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="budget-amount">Monthly Limit ($)</Label>
        <Input
          id="budget-amount"
          type="number"
          step="1"
          min="0"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (!amount || parseFloat(amount) <= 0) {
              toast.error("Please enter a valid amount")
              return
            }
            onSet(category, parseFloat(amount))
            onOpenChange(false)
            setAmount("")
          }}
          className="flex-1"
        >
          Set Budget
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Set Budget</DrawerTitle>
            <DrawerDescription>Set a monthly spending limit for a category</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Budget</DialogTitle>
          <DialogDescription>Set a monthly spending limit for a category</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

/* ─── Edit Budget Dialog ─── */

function EditBudgetDialog({
  open,
  onOpenChange,
  category,
  currentLimit,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: ExpenseCategory
  currentLimit: number
  onSave: (category: ExpenseCategory, limit: number) => void
}) {
  const isMobile = useIsMobile()
  const [amount, setAmount] = useState(currentLimit.toString())
  const info = getCategoryInfo(category)

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
          <info.icon className={cn("h-4 w-4", info.color)} />
          <span className="text-sm font-medium">{info.label}</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-budget-amount">Monthly Limit ($)</Label>
        <Input
          id="edit-budget-amount"
          type="number"
          step="1"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (!amount || parseFloat(amount) <= 0) {
              toast.error("Please enter a valid amount")
              return
            }
            onSave(category, parseFloat(amount))
          }}
          className="flex-1"
        >
          Update
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Budget</DrawerTitle>
            <DrawerDescription>Update the monthly limit for {info.label}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>Update the monthly limit for {info.label}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

