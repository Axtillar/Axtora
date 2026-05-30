"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ExpenseCategory } from "@/lib/finance-helpers"

export type ProjectPriority = "low" | "medium" | "high"
export type ProjectCategory = "home" | "travel" | "tech" | "education" | "health" | "savings" | "other"

export interface IncomeSource {
  id: string
  name: string
  amount: number
  frequency: "monthly" | "weekly" | "yearly" | "one-time"
  icon: string
  notes?: string
  nextPayDate?: string
  isActive: boolean
  createdAt: string
}

export interface Expense {
  id: string
  name: string
  amount: number
  category: ExpenseCategory
  date: string
  icon: string
  notes?: string
  paymentMethod?: "cash" | "card" | "upi" | "bank" | "other"
  isRecurring?: boolean
  createdAt: string
}

export interface WishlistItem {
  id: string
  name: string
  price: number
  link?: string
  imageUrl?: string
  purchased: boolean
  notes?: string
  category?: "tech" | "fashion" | "home" | "travel" | "entertainment" | "fitness" | "books" | "other"
  priority?: "low" | "medium" | "high"
  purchasedDate?: string
  createdAt: string
}

export interface ProjectItem {
  id: string
  name: string
  cost: number
  completed: boolean
  imageUrl?: string
  notes?: string
  quantity?: number
}

export interface Project {
  id: string
  name: string
  description?: string
  dueDate?: string
  priority: ProjectPriority
  category: ProjectCategory
  coverImage?: string
  status?: "not-started" | "in-progress" | "on-hold" | "completed"
  notes?: string
  items: ProjectItem[]
  createdAt: string
}

export interface BudgetLimit {
  category: ExpenseCategory
  limit: number
}

export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "INR" | "JPY" | "CNY" | "KRW"
  | "AED" | "SAR" | "AUD" | "CAD" | "CHF" | "BRL" | "MXN"
  | "SGD" | "THB" | "MYR" | "PHP" | "IDR" | "TRY" | "SEK"
  | "NOK" | "DKK" | "NZD" | "ZAR" | "EGP" | "NGN" | "PKR"
  | "BDT" | "LKR" | "VND" | "CZK" | "PLN" | "HUF" | "RON"

export type ActiveSection =
  | "dashboard"
  | "income"
  | "expenses"
  | "savings"
  | "wishlist"
  | "projects"
  | "settings"
  | "help"

export interface AppSettings {
  currency: CurrencyCode
  compactNumbers: boolean
  showCents: boolean
  startPage: ActiveSection
  lastBackupDate: string | null
}

interface FinanceState {
  incomeSources: IncomeSource[]
  expenses: Expense[]
  wishlistItems: WishlistItem[]
  projects: Project[]
  budgetLimits: BudgetLimit[]
  activeSection: ActiveSection
  settings: AppSettings

  setActiveSection: (section: ActiveSection) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  importData: (data: Partial<FinanceState>) => void
  clearAllData: () => void
  loadDemoData: () => void
  addIncomeSource: (source: Omit<IncomeSource, "id" | "createdAt">) => void
  updateIncomeSource: (id: string, source: Partial<IncomeSource>) => void
  deleteIncomeSource: (id: string) => void
  toggleIncomeActive: (id: string) => void
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  duplicateExpense: (id: string) => void
  addWishlistItem: (item: Omit<WishlistItem, "id" | "createdAt" | "purchased">) => void
  updateWishlistItem: (id: string, item: Partial<WishlistItem>) => void
  deleteWishlistItem: (id: string) => void
  toggleWishlistPurchased: (id: string) => void
  duplicateWishlistItem: (id: string) => void
  addProject: (project: Omit<Project, "id" | "createdAt" | "items">) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => void
  markProjectComplete: (id: string) => void
  addProjectItem: (projectId: string, item: Omit<ProjectItem, "id" | "completed">) => void
  updateProjectItem: (projectId: string, itemId: string, item: Partial<ProjectItem>) => void
  deleteProjectItem: (projectId: string, itemId: string) => void
  toggleProjectItemCompleted: (projectId: string, itemId: string) => void
  setBudgetLimit: (category: ExpenseCategory, limit: number) => void
  deleteBudgetLimit: (category: ExpenseCategory) => void

  getTotalMonthlyIncome: () => number
  getTotalMonthlyExpenses: () => number
  getAvailableBalance: () => number
  getCurrentSavings: () => number
  getExpensesByCategory: () => Record<ExpenseCategory, number>
  getWishlistTotal: () => number
  getWishlistRemaining: () => number
  getProjectTotal: (projectId: string) => number
  getProjectProgress: (projectId: string) => number
  getProjectSpent: (projectId: string) => number
  getCompletedItemsCount: (projectId: string) => number
  getProjectBudgetStatus: (projectId: string) => "under" | "on-track" | "over"

  _hasHydrated: boolean
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function toMonthlyAmount(
  amount: number,
  frequency: IncomeSource["frequency"]
): number {
  switch (frequency) {
    case "weekly": return amount * 4.33
    case "yearly": return amount / 12
    case "monthly": return amount
    case "one-time": return amount
    default: return amount
  }
}

// Clean up any corrupted or old data on module load
if (typeof window !== "undefined") {
  try {
    const keysToCheck = ["finance-store-v1", "finance-store-v2", "finance-store-v3", "finance-store-v4", "finance-store-v5"]
    keysToCheck.forEach((key) => {
      try {
        const val = localStorage.getItem(key)
        if (val) {
          JSON.parse(val) // Validate JSON
        }
      } catch {
        localStorage.removeItem(key)
      }
    })
  } catch {
    // Ignore
  }
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      incomeSources: [],
      expenses: [],
      wishlistItems: [],
      projects: [],
      budgetLimits: [],
      activeSection: "dashboard" as ActiveSection,
      settings: {
        currency: "USD" as CurrencyCode,
        compactNumbers: false,
        showCents: true,
        startPage: "dashboard" as ActiveSection,
        lastBackupDate: null,
      },
      _hasHydrated: false,

      setActiveSection: (section) => set({ activeSection: section }),

      updateSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),

      importData: (data) =>
        set({
          incomeSources: Array.isArray(data.incomeSources) ? data.incomeSources : [],
          expenses: Array.isArray(data.expenses) ? data.expenses : [],
          wishlistItems: Array.isArray(data.wishlistItems) ? data.wishlistItems : [],
          projects: Array.isArray(data.projects) ? data.projects : [],
          budgetLimits: Array.isArray(data.budgetLimits) ? data.budgetLimits : [],
          settings: data.settings && typeof data.settings === "object" ? { ...data.settings } as AppSettings : get().settings,
        }),

      clearAllData: () =>
        set({
          incomeSources: [],
          expenses: [],
          wishlistItems: [],
          projects: [],
          budgetLimits: [],
        }),

      loadDemoData: () => {
        const now = new Date()
        const y = now.getFullYear()
        const m = now.getMonth()
        const isoDate = (day: number) => new Date(y, m, day).toISOString().split("T")[0]
        const isoNow = now.toISOString()

        set({
          incomeSources: [
            { id: generateId(), name: "Salary", amount: 5000, frequency: "monthly", icon: "briefcase", notes: "Full-time job", nextPayDate: isoDate(1), isActive: true, createdAt: isoNow },
            { id: generateId(), name: "Freelance Design", amount: 1200, frequency: "monthly", icon: "palette", notes: "UI/UX projects", isActive: true, createdAt: isoNow },
            { id: generateId(), name: "Side Project", amount: 300, frequency: "monthly", icon: "code", notes: "App revenue", isActive: true, createdAt: isoNow },
          ],
          expenses: [
            { id: generateId(), name: "Rent", amount: 1500, category: "housing", date: isoDate(1), icon: "home", paymentMethod: "bank", isRecurring: true, createdAt: isoNow },
            { id: generateId(), name: "Groceries", amount: 350, category: "food", date: isoDate(5), icon: "shopping-cart", paymentMethod: "card", isRecurring: true, createdAt: isoNow },
            { id: generateId(), name: "Electricity Bill", amount: 120, category: "bills", date: isoDate(10), icon: "zap", paymentMethod: "bank", isRecurring: true, createdAt: isoNow },
            { id: generateId(), name: "Gas & Transport", amount: 200, category: "transport", date: isoDate(8), icon: "car", paymentMethod: "card", createdAt: isoNow },
            { id: generateId(), name: "Netflix & Spotify", amount: 25, category: "entertainment", date: isoDate(15), icon: "tv", paymentMethod: "card", isRecurring: true, createdAt: isoNow },
            { id: generateId(), name: "Gym Membership", amount: 50, category: "health", date: isoDate(1), icon: "heart", paymentMethod: "card", isRecurring: true, createdAt: isoNow },
            { id: generateId(), name: "Online Course", amount: 49, category: "education", date: isoDate(12), icon: "book", paymentMethod: "card", createdAt: isoNow },
            { id: generateId(), name: "New Shoes", amount: 89, category: "shopping", date: isoDate(18), icon: "shopping-bag", paymentMethod: "card", createdAt: isoNow },
          ],
          wishlistItems: [
            { id: generateId(), name: "MacBook Pro M4", price: 1999, link: "https://apple.com", purchased: false, category: "tech", priority: "high", notes: "Upgrade for work", createdAt: isoNow },
            { id: generateId(), name: "Sony WH-1000XM5", price: 349, purchased: false, category: "tech", priority: "medium", notes: "Noise cancelling headphones", createdAt: isoNow },
            { id: generateId(), name: "Weekend Trip", price: 500, purchased: false, category: "travel", priority: "low", createdAt: isoNow },
          ],
          projects: [
            {
              id: generateId(), name: "Home Office Setup", description: "Set up a productive workspace at home", priority: "high", category: "home", status: "in-progress",
              items: [
                { id: generateId(), name: "Standing Desk", cost: 450, completed: true, quantity: 1 },
                { id: generateId(), name: "Ergonomic Chair", cost: 350, completed: true, quantity: 1 },
                { id: generateId(), name: "Monitor Arm", cost: 80, completed: false, quantity: 1 },
                { id: generateId(), name: "LED Desk Lamp", cost: 55, completed: false, quantity: 1 },
              ],
              createdAt: isoNow,
            },
            {
              id: generateId(), name: "Japan Trip 2026", description: "Plan and budget for Japan vacation", priority: "medium", category: "travel", status: "not-started",
              items: [
                { id: generateId(), name: "Flights", cost: 1200, completed: false, quantity: 1 },
                { id: generateId(), name: "Hotel (7 nights)", cost: 700, completed: false, quantity: 1 },
                { id: generateId(), name: "JR Pass", cost: 300, completed: false, quantity: 1 },
                { id: generateId(), name: "Food & Activities", cost: 500, completed: false, quantity: 1 },
              ],
              createdAt: isoNow,
            },
          ],
          budgetLimits: [
            { category: "food", limit: 500 },
            { category: "entertainment", limit: 100 },
            { category: "shopping", limit: 200 },
            { category: "transport", limit: 250 },
          ],
        })
      },

      addIncomeSource: (source) =>
        set((state) => ({
          incomeSources: [...state.incomeSources, { ...source, id: generateId(), isActive: source.isActive ?? true, createdAt: new Date().toISOString() }],
        })),

      updateIncomeSource: (id, source) =>
        set((state) => ({ incomeSources: state.incomeSources.map((s) => s.id === id ? { ...s, ...source } : s) })),

      deleteIncomeSource: (id) =>
        set((state) => ({ incomeSources: state.incomeSources.filter((s) => s.id !== id) })),

      toggleIncomeActive: (id) =>
        set((state) => ({ incomeSources: state.incomeSources.map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s) })),

      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, { ...expense, id: generateId(), createdAt: new Date().toISOString() }] })),

      updateExpense: (id, expense) =>
        set((state) => ({ expenses: state.expenses.map((e) => e.id === id ? { ...e, ...expense } : e) })),

      deleteExpense: (id) =>
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

      duplicateExpense: (id) =>
        set((state) => {
          const expense = state.expenses.find((e) => e.id === id)
          if (!expense) return state
          return { expenses: [...state.expenses, { ...expense, id: generateId(), name: expense.name + " (copy)", createdAt: new Date().toISOString() }] }
        }),

      addWishlistItem: (item) =>
        set((state) => ({ wishlistItems: [...state.wishlistItems, { ...item, id: generateId(), purchased: false, createdAt: new Date().toISOString() }] })),

      updateWishlistItem: (id, item) =>
        set((state) => ({ wishlistItems: state.wishlistItems.map((w) => w.id === id ? { ...w, ...item } : w) })),

      deleteWishlistItem: (id) =>
        set((state) => ({ wishlistItems: state.wishlistItems.filter((w) => w.id !== id) })),

      toggleWishlistPurchased: (id) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.map((w) =>
            w.id === id ? { ...w, purchased: !w.purchased, purchasedDate: !w.purchased ? new Date().toISOString().split("T")[0] : undefined } : w
          ),
        })),

      duplicateWishlistItem: (id) =>
        set((state) => {
          const item = state.wishlistItems.find((w) => w.id === id)
          if (!item) return state
          return { wishlistItems: [...state.wishlistItems, { ...item, id: generateId(), name: item.name + " (copy)", purchased: false, purchasedDate: undefined, createdAt: new Date().toISOString() }] }
        }),

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, { ...project, id: generateId(), items: [], createdAt: new Date().toISOString() }] })),

      updateProject: (id, project) =>
        set((state) => ({ projects: state.projects.map((p) => p.id === id ? { ...p, ...project } : p) })),

      deleteProject: (id) =>
        set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),

      duplicateProject: (id) =>
        set((state) => {
          const project = state.projects.find((p) => p.id === id)
          if (!project) return state
          return { projects: [...state.projects, { ...project, id: generateId(), name: project.name + " (copy)", items: project.items.map((i) => ({ ...i, id: generateId(), completed: false })), status: "not-started" as const, createdAt: new Date().toISOString() }] }
        }),

      markProjectComplete: (id) =>
        set((state) => ({
          projects: state.projects.map((p) => p.id === id ? { ...p, status: "completed" as const, items: p.items.map((i) => ({ ...i, completed: true })) } : p),
        })),

      addProjectItem: (projectId, item) =>
        set((state) => ({
          projects: state.projects.map((p) => p.id === projectId ? { ...p, items: [...p.items, { ...item, id: generateId(), completed: false }] } : p),
        })),

      updateProjectItem: (projectId, itemId, item) =>
        set((state) => ({
          projects: state.projects.map((p) => p.id === projectId ? { ...p, items: p.items.map((i) => i.id === itemId ? { ...i, ...item } : i) } : p),
        })),

      deleteProjectItem: (projectId, itemId) =>
        set((state) => ({
          projects: state.projects.map((p) => p.id === projectId ? { ...p, items: p.items.filter((i) => i.id !== itemId) } : p),
        })),

      toggleProjectItemCompleted: (projectId, itemId) =>
        set((state) => ({
          projects: state.projects.map((p) => p.id === projectId ? { ...p, items: p.items.map((i) => i.id === itemId ? { ...i, completed: !i.completed } : i) } : p),
        })),

      setBudgetLimit: (category, limit) =>
        set((state) => {
          const existing = state.budgetLimits.find((b) => b.category === category)
          if (existing) return { budgetLimits: state.budgetLimits.map((b) => b.category === category ? { ...b, limit } : b) }
          return { budgetLimits: [...state.budgetLimits, { category, limit }] }
        }),

      deleteBudgetLimit: (category) =>
        set((state) => ({ budgetLimits: state.budgetLimits.filter((b) => b.category !== category) })),

      getTotalMonthlyIncome: () => {
        const { incomeSources } = get()
        return incomeSources.filter((s) => s.isActive).reduce((sum, s) => sum + toMonthlyAmount(s.amount, s.frequency), 0)
      },

      getTotalMonthlyExpenses: () => {
        const { expenses } = get()
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
        return expenses.filter((e) => e.date >= monthStart).reduce((sum, e) => sum + e.amount, 0)
      },

      getAvailableBalance: () => get().getTotalMonthlyIncome() - get().getTotalMonthlyExpenses(),

      getCurrentSavings: () => get().getAvailableBalance(),

      getExpensesByCategory: () => {
        const { expenses } = get()
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
        const result: Record<ExpenseCategory, number> = { housing: 0, food: 0, transport: 0, shopping: 0, entertainment: 0, health: 0, education: 0, bills: 0, other: 0 }
        expenses.filter((e) => e.date >= monthStart).forEach((e) => { if (e.category in result) result[e.category] += e.amount })
        return result
      },

      getWishlistTotal: () => get().wishlistItems.filter((w) => !w.purchased).reduce((sum, w) => sum + w.price, 0),

      getWishlistRemaining: () => get().getWishlistTotal(),

      getProjectTotal: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project) return 0
        return project.items.reduce((sum, i) => sum + i.cost * (i.quantity || 1), 0)
      },

      getProjectProgress: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project || project.items.length === 0) return 0
        return Math.round((project.items.filter((i) => i.completed).length / project.items.length) * 100)
      },

      getProjectSpent: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project) return 0
        return project.items.filter((i) => i.completed).reduce((sum, i) => sum + i.cost * (i.quantity || 1), 0)
      },

      getCompletedItemsCount: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project) return 0
        return project.items.filter((i) => i.completed).length
      },

      getProjectBudgetStatus: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project) return "under"
        const total = project.items.reduce((sum, i) => sum + i.cost * (i.quantity || 1), 0)
        const spent = project.items.filter((i) => i.completed).reduce((sum, i) => sum + i.cost * (i.quantity || 1), 0)
        if (total === 0) return "under"
        const ratio = spent / total
        if (ratio > 0.8) return "over"
        if (ratio > 0.5) return "on-track"
        return "under"
      },
    }),
    {
      name: "axtora-v6",
      version: 6,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        }
        return localStorage
      }),
      partialize: (state: FinanceState) => {
        const { _hasHydrated, ...rest } = state
        return rest
      },
      onRehydrateStorage: () => {
        return () => {
          // Simple and safe — just mark hydrated
          useFinanceStore.setState({ _hasHydrated: true })
        }
      },
      migrate: (persistedState: Record<string, unknown>, version: number) => {
        if (version < 2) {
          persistedState = {
            ...persistedState,
            settings: { currency: "USD", compactNumbers: false, showCents: true, startPage: "dashboard", lastBackupDate: null },
          }
        }
        if (persistedState) {
          if (!Array.isArray(persistedState.incomeSources)) persistedState.incomeSources = []
          if (!Array.isArray(persistedState.expenses)) persistedState.expenses = []
          if (!Array.isArray(persistedState.wishlistItems)) persistedState.wishlistItems = []
          if (!Array.isArray(persistedState.projects)) persistedState.projects = []
          if (!Array.isArray(persistedState.budgetLimits)) persistedState.budgetLimits = []
          if (typeof persistedState.settings !== "object" || persistedState.settings === null) {
            persistedState.settings = { currency: "USD", compactNumbers: false, showCents: true, startPage: "dashboard", lastBackupDate: null }
          }
        }
        return persistedState
      },
    }
  )
)
