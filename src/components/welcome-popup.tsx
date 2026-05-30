"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFinanceStore } from "@/store/finance-store"

// Use a key that does NOT start with "axtora" or "finance-store"
// so it survives the "Clear All Data" operation in settings.
const WELCOME_DISMISSED_KEY = "welcome-popup-dismissed"

export function WelcomePopup() {
  const [open, setOpen] = useState(false)
  const loadDemoData = useFinanceStore((s) => s.loadDemoData)

  useEffect(() => {
    const hasShown = localStorage.getItem(WELCOME_DISMISSED_KEY)
    if (!hasShown) {
      const timer = setTimeout(() => {
        setOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true")
    setOpen(false)
  }

  const handleLoadDemo = () => {
    loadDemoData()
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true")
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        localStorage.setItem(WELCOME_DISMISSED_KEY, "true")
      }
      setOpen(isOpen)
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome to Axtora! 🎉</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to load some demo data to explore the app? You can always clear it later from Settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleDismiss} className="w-full sm:w-auto">
            Don&apos;t show again
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLoadDemo}
            className="bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90 w-full sm:w-auto"
          >
            Load Demo Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
