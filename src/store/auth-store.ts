"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { hashSecret, isHashed } from "@/lib/hash"

export type AvatarId =
  | "fox" | "cat" | "bear" | "rabbit" | "dog"
  | "panda" | "penguin" | "owl" | "lion" | "unicorn"
  | "dolphin" | "eagle" | "wolf" | "dragon" | "koala"

export const AVATARS: { id: AvatarId; emoji: string; label: string }[] = [
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "cat", emoji: "🐱", label: "Cat" },
  { id: "bear", emoji: "🐻", label: "Bear" },
  { id: "rabbit", emoji: "🐰", label: "Rabbit" },
  { id: "dog", emoji: "🐶", label: "Dog" },
  { id: "panda", emoji: "🐼", label: "Panda" },
  { id: "penguin", emoji: "🐧", label: "Penguin" },
  { id: "owl", emoji: "🦉", label: "Owl" },
  { id: "lion", emoji: "🦁", label: "Lion" },
  { id: "unicorn", emoji: "🦄", label: "Unicorn" },
  { id: "dolphin", emoji: "🐬", label: "Dolphin" },
  { id: "eagle", emoji: "🦅", label: "Eagle" },
  { id: "wolf", emoji: "🐺", label: "Wolf" },
  { id: "dragon", emoji: "🐉", label: "Dragon" },
  { id: "koala", emoji: "🐨", label: "Koala" },
]

export function getAvatarEmoji(id?: string): string {
  if (!id) return "🦊"
  const found = AVATARS.find((a) => a.id === id)
  return found ? found.emoji : "🦊"
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarId: AvatarId
  isGuest: boolean
  /** SHA-256 hash of salted password. Never stored in plain text. */
  passwordHash?: string
  /** SHA-256 hash of salted PIN. Never stored in plain text. */
  pinHash?: string
  onboardingCompleted: boolean
  workspaceName?: string
  preferredCurrency?: string
  preferredTheme?: "light" | "dark" | "system"
  createdAt: string
  lastLoginAt: string
}

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  _hasHydrated: boolean

  signup: (name: string, email: string, password: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  loginAsGuest: () => void
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
  completeOnboarding: () => void
  verifyPassword: (password: string) => Promise<boolean>
  verifyPin: (pin: string) => Promise<boolean>
  setPin: (pin: string) => Promise<void>
  hasAccount: () => boolean
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

type PersistedAuthState = Omit<AuthState, "_hasHydrated">

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      signup: async (name: string, email: string, password: string): Promise<boolean> => {
        const { user } = get()
        if (user) {
          useAuthStore.setState({ user: null, isAuthenticated: false })
        }
        const passwordHash = await hashSecret(password)
        const now = new Date().toISOString()
        const newUser: UserProfile = {
          id: generateId(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          avatarId: "fox",
          isGuest: false,
          passwordHash,
          onboardingCompleted: false,
          createdAt: now,
          lastLoginAt: now,
        }
        set({ user: newUser, isAuthenticated: true })
        return true
      },

      login: async (email: string, password: string): Promise<boolean> => {
        const { user } = get()
        if (!user) return false
        if (user.email !== email.trim().toLowerCase()) return false
        if (!user.passwordHash) return false

        // Migrate legacy btoa passwords on first login
        let storedHash = user.passwordHash
        if (!isHashed(storedHash)) {
          // Old btoa-encoded password — re-hash it properly
          const legacyDecoded = atob(storedHash)
          if (legacyDecoded !== password) return false
          storedHash = await hashSecret(password)
          set({ user: { ...user, passwordHash: storedHash, lastLoginAt: new Date().toISOString() }, isAuthenticated: true })
          return true
        }

        const attemptHash = await hashSecret(password)
        if (attemptHash !== storedHash) return false

        set({
          user: { ...user, lastLoginAt: new Date().toISOString() },
          isAuthenticated: true,
        })
        return true
      },

      loginAsGuest: () => {
        const now = new Date().toISOString()
        const guestUser: UserProfile = {
          id: generateId(),
          name: "Guest User",
          email: "guest@axtora.local",
          avatarId: "panda",
          isGuest: true,
          onboardingCompleted: true,
          createdAt: now,
          lastLoginAt: now,
        }
        set({ user: guestUser, isAuthenticated: true })
      },

      logout: () => {
        set({ isAuthenticated: false })
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, ...updates } })
      },

      completeOnboarding: () => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, onboardingCompleted: true } })
      },

      verifyPassword: async (password: string): Promise<boolean> => {
        const { user } = get()
        if (!user || !user.passwordHash) return false
        if (!isHashed(user.passwordHash)) {
          // Legacy btoa
          return atob(user.passwordHash) === password
        }
        const hash = await hashSecret(password)
        return hash === user.passwordHash
      },

      verifyPin: async (pin: string): Promise<boolean> => {
        const { user } = get()
        if (!user || !user.pinHash) return false
        if (!isHashed(user.pinHash)) {
          // Legacy btoa
          return atob(user.pinHash) === pin
        }
        const hash = await hashSecret(pin)
        return hash === user.pinHash
      },

      setPin: async (pin: string): Promise<void> => {
        const { user } = get()
        if (!user) return
        const pinHash = await hashSecret(pin)
        set({ user: { ...user, pinHash } })
      },

      hasAccount: (): boolean => {
        const { user } = get()
        return !!user && !user.isGuest
      },
    }),
    {
      name: "axtora-auth",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        }
        return localStorage
      }),
      partialize: (state: AuthState): PersistedAuthState => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _hasHydrated, ...rest } = state
        return rest
      },
      onRehydrateStorage: () => {
        return () => {
          useAuthStore.setState({ _hasHydrated: true })
        }
      },
    }
  )
)
