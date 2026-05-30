"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore } from "@/store/finance-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCategoryInfo, EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/finance-helpers"
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

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FormContent({
  onSubmit,
  onCancel,
}: {
  onSubmit: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<ExpenseCategory>("food")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("card")
  const [isRecurring, setIsRecurring] = useState(false)
  const addExpense = useFinanceStore((s) => s.addExpense)

  const handleSubmit = () => {
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in all required fields")
      return
    }
    addExpense({
      name: name.trim(),
      amount: parseFloat(amount),
      category,
      date,
      icon: getCategoryInfo(category).label,
      notes: notes.trim() || undefined,
      paymentMethod: paymentMethod as "cash" | "card" | "upi" | "bank" | "other",
      isRecurring,
    })
    toast.success("Expense added")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expense-name">Name</Label>
        <Input
          id="expense-name"
          placeholder="e.g., Groceries"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-amount">Amount ($)</Label>
        <Input
          id="expense-amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
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
        <Label htmlFor="expense-date">Date</Label>
        <Input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-notes">Notes (optional)</Label>
        <Textarea
          id="expense-notes"
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
          <Label htmlFor="expense-recurring">Recurring</Label>
          <p className="text-[11px] text-muted-foreground">This expense repeats regularly</p>
        </div>
        <Switch
          id="expense-recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Add Expense
        </Button>
      </div>
    </div>
  )
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Expense</DrawerTitle>
            <DrawerDescription>Record a new expense</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">
            <FormContent onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record a new expense</DialogDescription>
        </DialogHeader>
        <FormContent onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
