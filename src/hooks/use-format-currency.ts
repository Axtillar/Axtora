import { useCallback } from "react"
import { useFinanceStore } from "@/store/finance-store"
import { formatCurrency } from "@/lib/finance-helpers"

export function useFormatCurrency() {
  const currency = useFinanceStore((s) => s.settings.currency)
  const compactNumbers = useFinanceStore((s) => s.settings.compactNumbers)
  const showCents = useFinanceStore((s) => s.settings.showCents)

  return useCallback(
    (amount: number, options?: { compact?: boolean; showCents?: boolean }) => {
      return formatCurrency(amount, currency, {
        compact: options?.compact ?? compactNumbers,
        showCents: options?.showCents ?? showCents,
      })
    },
    [currency, compactNumbers, showCents]
  )
}
