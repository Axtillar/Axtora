import {
  Home,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Gamepad2,
  Heart,
  GraduationCap,
  FileText,
  MoreHorizontal,
  Plane,
  Laptop,
  PiggyBank,
  Folder,
  type LucideIcon,
} from "lucide-react"
import type { CurrencyCode } from "@/store/finance-store"

export type ExpenseCategory =
  | "housing"
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "health"
  | "education"
  | "bills"
  | "other"

export type ProjectPriority = "low" | "medium" | "high"
export type ProjectCategory = "home" | "travel" | "tech" | "education" | "health" | "savings" | "other"

interface CategoryInfo {
  icon: LucideIcon
  label: string
  color: string
  bgColor: string
  darkBgColor: string
}

const categoryMap: Record<ExpenseCategory, CategoryInfo> = {
  housing: {
    icon: Home,
    label: "Housing",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100",
    darkBgColor: "dark:bg-orange-900/30",
  },
  food: {
    icon: UtensilsCrossed,
    label: "Food",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100",
    darkBgColor: "dark:bg-amber-900/30",
  },
  transport: {
    icon: Car,
    label: "Transport",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100",
    darkBgColor: "dark:bg-teal-900/30",
  },
  shopping: {
    icon: ShoppingBag,
    label: "Shopping",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100",
    darkBgColor: "dark:bg-pink-900/30",
  },
  entertainment: {
    icon: Gamepad2,
    label: "Entertainment",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100",
    darkBgColor: "dark:bg-purple-900/30",
  },
  health: {
    icon: Heart,
    label: "Health",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100",
    darkBgColor: "dark:bg-red-900/30",
  },
  education: {
    icon: GraduationCap,
    label: "Education",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100",
    darkBgColor: "dark:bg-violet-900/30",
  },
  bills: {
    icon: FileText,
    label: "Bills",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100",
    darkBgColor: "dark:bg-slate-800/30",
  },
  other: {
    icon: MoreHorizontal,
    label: "Other",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100",
    darkBgColor: "dark:bg-gray-800/30",
  },
}

export function getCategoryInfo(category: ExpenseCategory): CategoryInfo {
  return categoryMap[category]
}

interface ProjectCategoryInfo {
  icon: LucideIcon
  label: string
  color: string
  bgColor: string
  darkBgColor: string
}

const projectCategoryMap: Record<ProjectCategory, ProjectCategoryInfo> = {
  home: {
    icon: Home,
    label: "Home",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100",
    darkBgColor: "dark:bg-orange-900/30",
  },
  travel: {
    icon: Plane,
    label: "Travel",
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-100",
    darkBgColor: "dark:bg-sky-900/30",
  },
  tech: {
    icon: Laptop,
    label: "Tech",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100",
    darkBgColor: "dark:bg-violet-900/30",
  },
  education: {
    icon: GraduationCap,
    label: "Education",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100",
    darkBgColor: "dark:bg-amber-900/30",
  },
  health: {
    icon: Heart,
    label: "Health",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100",
    darkBgColor: "dark:bg-red-900/30",
  },
  savings: {
    icon: PiggyBank,
    label: "Savings",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100",
    darkBgColor: "dark:bg-indigo-900/30",
  },
  other: {
    icon: Folder,
    label: "Other",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100",
    darkBgColor: "dark:bg-gray-800/30",
  },
}

export function getCategoryInfo_project(category: ProjectCategory): ProjectCategoryInfo {
  return projectCategoryMap[category]
}

interface PriorityInfo {
  label: string
  color: string
  dotColor: string
  bgColor: string
  darkBgColor: string
}

const priorityMap: Record<ProjectPriority, PriorityInfo> = {
  low: {
    label: "Low",
    color: "text-indigo-600 dark:text-indigo-400",
    dotColor: "bg-indigo-500",
    bgColor: "bg-indigo-100",
    darkBgColor: "dark:bg-indigo-900/30",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-100",
    darkBgColor: "dark:bg-amber-900/30",
  },
  high: {
    label: "High",
    color: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500",
    bgColor: "bg-red-100",
    darkBgColor: "dark:bg-red-900/30",
  },
}

export function getPriorityInfo(priority: ProjectPriority): PriorityInfo {
  return priorityMap[priority]
}

export interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  name: string
  locale: string
  flag: string
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", flag: "🇺🇸" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", flag: "🇬🇧" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", flag: "🇮🇳" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", flag: "🇯🇵" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN", flag: "🇨🇳" },
  KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", locale: "ko-KR", flag: "🇰🇷" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE", flag: "🇦🇪" },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", locale: "ar-SA", flag: "🇸🇦" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", flag: "🇦🇺" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA", flag: "🇨🇦" },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", locale: "de-CH", flag: "🇨🇭" },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", locale: "pt-BR", flag: "🇧🇷" },
  MXN: { code: "MXN", symbol: "MX$", name: "Mexican Peso", locale: "es-MX", flag: "🇲🇽" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG", flag: "🇸🇬" },
  THB: { code: "THB", symbol: "฿", name: "Thai Baht", locale: "th-TH", flag: "🇹🇭" },
  MYR: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", locale: "ms-MY", flag: "🇲🇾" },
  PHP: { code: "PHP", symbol: "₱", name: "Philippine Peso", locale: "fil-PH", flag: "🇵🇭" },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", locale: "id-ID", flag: "🇮🇩" },
  TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira", locale: "tr-TR", flag: "🇹🇷" },
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona", locale: "sv-SE", flag: "🇸🇪" },
  NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone", locale: "nb-NO", flag: "🇳🇴" },
  DKK: { code: "DKK", symbol: "kr", name: "Danish Krone", locale: "da-DK", flag: "🇩🇰" },
  NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", locale: "en-NZ", flag: "🇳🇿" },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA", flag: "🇿🇦" },
  EGP: { code: "EGP", symbol: "E£", name: "Egyptian Pound", locale: "ar-EG", flag: "🇪🇬" },
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", locale: "en-NG", flag: "🇳🇬" },
  PKR: { code: "PKR", symbol: "₨", name: "Pakistani Rupee", locale: "ur-PK", flag: "🇵🇰" },
  BDT: { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", locale: "bn-BD", flag: "🇧🇩" },
  LKR: { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", locale: "si-LK", flag: "🇱🇰" },
  VND: { code: "VND", symbol: "₫", name: "Vietnamese Dong", locale: "vi-VN", flag: "🇻🇳" },
  CZK: { code: "CZK", symbol: "Kč", name: "Czech Koruna", locale: "cs-CZ", flag: "🇨🇿" },
  PLN: { code: "PLN", symbol: "zł", name: "Polish Zloty", locale: "pl-PL", flag: "🇵🇱" },
  HUF: { code: "HUF", symbol: "Ft", name: "Hungarian Forint", locale: "hu-HU", flag: "🇭🇺" },
  RON: { code: "RON", symbol: "lei", name: "Romanian Leu", locale: "ro-RO", flag: "🇷🇴" },
}

export const CURRENCY_LIST = Object.values(CURRENCIES)

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
  options?: { compact?: boolean; showCents?: boolean }
): string {
  const info = CURRENCIES[currency] || CURRENCIES.USD
  const showCents = options?.showCents ?? true
  const compact = options?.compact ?? false

  if (compact && Math.abs(amount) >= 1000) {
    const suffixes = ["", "K", "M", "B", "T"] as const
    const tier = (Math.log10(Math.abs(amount)) / 3) | 0
    const suffix = suffixes[tier]
    const scale = Math.pow(10, tier * 3)
    const scaled = amount / scale
    return `${info.symbol}${scaled.toFixed(scaled % 1 === 0 ? 0 : 1)}${suffix}`
  }

  try {
    return new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: showCents ? (currency === "JPY" || currency === "KRW" || currency === "VND" || currency === "IDR" ? 0 : 0) : 0,
      maximumFractionDigits: showCents ? (currency === "JPY" || currency === "KRW" || currency === "VND" || currency === "IDR" ? 0 : 2) : 0,
    }).format(amount)
  } catch {
    return `${info.symbol}${amount.toLocaleString()}`
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDate.getTime() === today.getTime()) return "Today"
  if (targetDate.getTime() === yesterday.getTime()) return "Yesterday"
  if (targetDate > weekAgo) return "This week"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDate.getTime() === today.getTime()) return "today"
  if (targetDate.getTime() === yesterday.getTime()) return "yesterday"
  if (targetDate > weekAgo) return "thisWeek"
  return "earlier"
}

export function getGreeting(userName?: string): string {
  const hour = new Date().getHours()
  let greeting: string
  let emoji: string

  if (hour < 5) {
    greeting = "Good night"
    emoji = "🌙"
  } else if (hour < 12) {
    greeting = "Good morning"
    emoji = "☀️"
  } else if (hour < 17) {
    greeting = "Good afternoon"
    emoji = "🌤️"
  } else if (hour < 21) {
    greeting = "Good evening"
    emoji = "🌆"
  } else {
    greeting = "Good night"
    emoji = "🌙"
  }

  const name = userName?.trim()
  if (name) {
    const firstName = name.split(" ")[0]
    return `${emoji} ${greeting}, ${firstName}!`
  }
  return `${emoji} ${greeting}!`
}

export function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "housing",
  "food",
  "transport",
  "shopping",
  "entertainment",
  "health",
  "education",
  "bills",
  "other",
]

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "home",
  "travel",
  "tech",
  "education",
  "health",
  "savings",
  "other",
]

export const PROJECT_PRIORITIES: ProjectPriority[] = [
  "low",
  "medium",
  "high",
]
