"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore } from "@/store/finance-store"
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
import {
  Briefcase, DollarSign, TrendingUp, Building2, Laptop, Gift, PiggyBank, Landmark,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const iconOptions = [
  { value: "Briefcase", icon: Briefcase, label: "Salary" },
  { value: "DollarSign", icon: DollarSign, label: "Cash" },
  { value: "TrendingUp", icon: TrendingUp, label: "Investment" },
  { value: "Building2", icon: Building2, label: "Business" },
  { value: "Laptop", icon: Laptop, label: "Freelance" },
  { value: "Gift", icon: Gift, label: "Gift" },
  { value: "PiggyBank", icon: PiggyBank, label: "Savings" },
  { value: "Landmark", icon: Landmark, label: "Dividend" },
]

interface EditIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incomeId: string
}

function FormContent({
  incomeId,
  onSubmit,
  onCancel,
}: {
  incomeId: string
  onSubmit: () => void
  onCancel: () => void
}) {
  const source = useFinanceStore((s) => s.incomeSources.find((src) => src.id === incomeId))
  const updateIncomeSource = useFinanceStore((s) => s.updateIncomeSource)

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState<"monthly" | "weekly" | "yearly" | "one-time">("monthly")
  const [icon, setIcon] = useState("Briefcase")
  const [notes, setNotes] = useState("")
  const [nextPayDate, setNextPayDate] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (source) {
      setName(source.name)
      setAmount(source.amount.toString())
      setFrequency(source.frequency)
      setIcon(source.icon)
      setNotes(source.notes || "")
      setNextPayDate(source.nextPayDate || "")
      setIsActive(source.isActive)
    }
  // Only re-initialize form when incomeId changes (dialog opens for different item)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeId])

  if (!source) return null

  const handleSubmit = () => {
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in name and amount")
      return
    }
    updateIncomeSource(incomeId, {
      name: name.trim(),
      amount: parseFloat(amount),
      frequency,
      icon,
      notes: notes.trim() || undefined,
      nextPayDate: nextPayDate || undefined,
      isActive,
    })
    toast.success("Income updated")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-income-name">Name</Label>
        <Input id="edit-income-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-income-amount">Amount ($)</Label>
        <Input id="edit-income-amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Frequency</Label>
        <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="one-time">One-time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-income-next-pay">Next Pay Date</Label>
        <Input
          id="edit-income-next-pay"
          type="date"
          value={nextPayDate}
          onChange={(e) => setNextPayDate(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-income-notes">Notes</Label>
        <Textarea
          id="edit-income-notes"
          placeholder="Add any notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-4 gap-2">
          {iconOptions.map((opt) => {
            const Icon = opt.icon
            return (
              <button key={opt.value} type="button" onClick={() => setIcon(opt.value)}
                className={cn("flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors",
                  icon === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                )}>
                <Icon className="h-5 w-5" />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="edit-income-active" className="text-sm">Active</Label>
          <p className="text-[10px] text-muted-foreground">Inactive sources excluded from totals</p>
        </div>
        <Switch
          id="edit-income-active"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}

export function EditIncomeDialog({ open, onOpenChange, incomeId }: EditIncomeDialogProps) {
  const isMobile = useIsMobile()
  const content = <FormContent incomeId={incomeId} onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Edit Income</DrawerTitle><DrawerDescription>Update this income source</DrawerDescription></DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Income</DialogTitle><DialogDescription>Update this income source</DialogDescription></DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
