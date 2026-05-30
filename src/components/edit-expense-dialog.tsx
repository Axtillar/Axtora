"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore } from "@/store/finance-store"
import { getCategoryInfo, EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/finance-helpers"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Banknote, CreditCard, Smartphone, Building2, Wallet } from "lucide-react"

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "bank", label: "Bank Transfer", icon: Building2 },
  { value: "other", label: "Other", icon: Wallet },
] as const

interface EditExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseId: string
}

function FormContent({
  expenseId,
  onSubmit,
  onCancel,
}: {
  expenseId: string
  onSubmit: () => void
  onCancel: () => void
}) {
  const expense = useFinanceStore((s) => s.expenses.find((e) => e.id === expenseId))
  const updateExpense = useFinanceStore((s) => s.updateExpense)

  const [name, setName] = useState(expense?.name ?? "")
  const [amount, setAmount] = useState(expense?.amount.toString() ?? "")
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "food")
  const [date, setDate] = useState(expense?.date ?? "")
  const [notes, setNotes] = useState(expense?.notes ?? "")
  const [paymentMethod, setPaymentMethod] = useState<string>(expense?.paymentMethod ?? "card")
  const [isRecurring, setIsRecurring] = useState(expense?.isRecurring ?? false)

  if (!expense) return null

  const handleSubmit = () => {
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in all required fields")
      return
    }
    updateExpense(expenseId, {
      name: name.trim(),
      amount: parseFloat(amount),
      category,
      date,
      icon: getCategoryInfo(category).label,
      notes: notes.trim() || undefined,
      paymentMethod: paymentMethod as "cash" | "card" | "upi" | "bank" | "other",
      isRecurring,
    })
    toast.success("Expense updated")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-expense-name">Name</Label>
        <Input id="edit-expense-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-expense-amount">Amount ($)</Label>
        <Input id="edit-expense-amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((cat) => {
              const info = getCategoryInfo(cat)
              const Icon = info.icon
              return (
                <SelectItem key={cat} value={cat}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", info.color)} />
                    {info.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-expense-date">Date</Label>
        <Input id="edit-expense-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-expense-notes">Notes (optional)</Label>
        <Textarea
          id="edit-expense-notes"
          placeholder="Add any notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((pm) => {
              const PmIcon = pm.icon
              return (
                <SelectItem key={pm.value} value={pm.value}>
                  <div className="flex items-center gap-2">
                    <PmIcon className="h-4 w-4" />
                    {pm.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="space-y-0.5">
          <Label htmlFor="edit-expense-recurring">Recurring</Label>
          <p className="text-[11px] text-muted-foreground">This expense repeats regularly</p>
        </div>
        <Switch
          id="edit-expense-recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}

export function EditExpenseDialog({ open, onOpenChange, expenseId }: EditExpenseDialogProps) {
  const isMobile = useIsMobile()
  const content = <FormContent key={expenseId} expenseId={expenseId} onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Edit Expense</DrawerTitle><DrawerDescription>Update this expense</DrawerDescription></DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Expense</DialogTitle><DialogDescription>Update this expense</DialogDescription></DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
