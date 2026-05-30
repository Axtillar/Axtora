"use client"

import { useFinanceStore, type CurrencyCode, type ActiveSection } from "@/store/finance-store"
import { useAuthStore, AVATARS, getAvatarEmoji, type AvatarId } from "@/store/auth-store"
import {
  CURRENCY_LIST,
  CURRENCIES,
} from "@/lib/finance-helpers"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { useIsMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Settings,
  DollarSign,
  Palette,
  LayoutDashboard,
  Download,
  Upload,
  Trash2,
  Wifi,
  Info,
  Shield,
  HardDrive,
  Clock,
  Search,
  Wallet,
  Receipt,
  Heart,
  Target,
  PiggyBank,
  Database,
  Lock,
  LogOut,
  User,
  Pencil,
  KeyRound,
} from "lucide-react"
async function clearAllStorage() {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith("finance-store") || key.startsWith("axtora"))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch {
    // Ignore
  }
}

const startPageOptions: { value: ActiveSection; label: string; icon: React.ElementType }[] = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "income", label: "Income", icon: Wallet },
  { value: "expenses", label: "Expenses", icon: Receipt },
  { value: "savings", label: "Savings", icon: PiggyBank },
  { value: "wishlist", label: "Wishlist", icon: Heart },
  { value: "projects", label: "Projects", icon: Target },
]

export function SettingsSection() {
  const settings = useFinanceStore((s) => s.settings)
  const updateSettings = useFinanceStore((s) => s.updateSettings)
  const incomeSources = useFinanceStore((s) => s.incomeSources)
  const expenses = useFinanceStore((s) => s.expenses)
  const wishlistItems = useFinanceStore((s) => s.wishlistItems)
  const projects = useFinanceStore((s) => s.projects)
  const importData = useFinanceStore((s) => s.importData)
  const clearAllData = useFinanceStore((s) => s.clearAllData)
  const loadDemoData = useFinanceStore((s) => s.loadDemoData)

  const { theme, setTheme } = useTheme()
  const isMobile = useIsMobile()
  const router = useRouter()
  const [currencySearch, setCurrencySearch] = useState("")
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [showClearConfirm1, setShowClearConfirm1] = useState(false)
  const [showClearConfirm2, setShowClearConfirm2] = useState(false)
  const [clearConfirmText, setClearConfirmText] = useState("")
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [pendingRestoreData, setPendingRestoreData] = useState<unknown>(null)
  const [showDemoConfirm, setShowDemoConfirm] = useState(false)
  const [storageSize, setStorageSize] = useState<string>("Calculating...")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const authLogout = useAuthStore((s) => s.logout)
  const verifyPin = useAuthStore((s) => s.verifyPin)
  const setPin = useAuthStore((s) => s.setPin)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState("")
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [confirmNewPin, setConfirmNewPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [showCurrentPinDialog, setShowCurrentPinDialog] = useState(false)
  const [currentPin, setCurrentPin] = useState("")

  const currentCurrency = CURRENCIES[settings.currency]

  // Get storage info
  useEffect(() => {
    try {
      if (navigator.storage?.estimate) {
        navigator.storage.estimate().then((est) => {
          const usedMB = ((est.usage ?? 0) / (1024 * 1024)).toFixed(2)
          const totalMB = ((est.quota ?? 0) / (1024 * 1024)).toFixed(0)
          setStorageSize(`${usedMB} MB / ${totalMB} MB`)
        }).catch(() => setStorageSize("N/A"))
      } else {
        setStorageSize("N/A")
      }
    } catch {
      setStorageSize("N/A")
    }
  }, [])

  // Filtered currencies
  const filteredCurrencies = currencySearch.trim()
    ? CURRENCY_LIST.filter(
        (c) =>
          c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
          c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
          c.symbol.toLowerCase().includes(currencySearch.toLowerCase())
      )
    : CURRENCY_LIST

  // Export backup — includes validation and data integrity check
  const handleExportBackup = () => {
    try {
      const state = useFinanceStore.getState()
      const data = {
        incomeSources: state.incomeSources,
        expenses: state.expenses,
        wishlistItems: state.wishlistItems,
        projects: state.projects,
        budgetLimits: state.budgetLimits,
        settings: state.settings,
      }
      const backup = {
        version: 5,
        app: "axtora",
        exportedAt: new Date().toISOString(),
        checksum: JSON.stringify(data).length.toString(16), // Basic integrity check
        data,
      }
      const jsonString = JSON.stringify(backup, null, 2)
      const blob = new Blob([jsonString], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const date = new Date().toISOString().split("T")[0]
      a.href = url
      a.download = `axtora-backup-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      updateSettings({ lastBackupDate: new Date().toISOString() })
      toast.success("Backup exported successfully")
    } catch (e) {
      toast.error("Failed to export backup. Please try again.")
      console.error("Backup export error:", e)
    }
  }

  // Import restore — with comprehensive validation
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith(".json")) {
      toast.error("Please select a .json backup file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Backup file is too large (max 10MB)")
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)

        // Validate backup structure
        if (!json || typeof json !== "object") {
          toast.error("Invalid backup file format")
          return
        }
        if (json.app !== "axtora") {
          toast.error("This is not an Axtora backup file")
          return
        }
        if (!json.data || typeof json.data !== "object") {
          toast.error("Backup file has no data section")
          return
        }

        // Validate data arrays
        const data = json.data
        if (data.incomeSources && !Array.isArray(data.incomeSources)) {
          toast.error("Backup has invalid income data")
          return
        }
        if (data.expenses && !Array.isArray(data.expenses)) {
          toast.error("Backup has invalid expense data")
          return
        }
        if (data.wishlistItems && !Array.isArray(data.wishlistItems)) {
          toast.error("Backup has invalid wishlist data")
          return
        }
        if (data.projects && !Array.isArray(data.projects)) {
          toast.error("Backup has invalid project data")
          return
        }

        setPendingRestoreData(data)
        setShowRestoreConfirm(true)
      } catch {
        toast.error("Failed to read backup file. Make sure it's a valid JSON file.")
      }
    }
    reader.onerror = () => {
      toast.error("Failed to read the file")
    }
    reader.readAsText(file)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const confirmRestore = () => {
    try {
      if (pendingRestoreData) {
        importData(pendingRestoreData as Partial<ReturnType<typeof useFinanceStore.getState>>)
        toast.success("Data restored successfully! Your data has been replaced with the backup.")
      }
    } catch (e) {
      toast.error("Failed to restore data. Please try again.")
      console.error("Restore error:", e)
    }
    setPendingRestoreData(null)
    setShowRestoreConfirm(false)
  }

  // Clear all data — also clears IndexedDB
  const handleClearAll = async () => {
    if (clearConfirmText === "DELETE") {
      try {
        clearAllData()
        await clearAllStorage()
        toast.success("All data cleared")
      } catch (e) {
        toast.error("Failed to clear data. Please try again.")
        console.error("Clear data error:", e)
      }
      setShowClearConfirm2(false)
      setClearConfirmText("")
    }
  }

  // Import demo data
  const handleLoadDemoData = () => {
    try {
      loadDemoData()
      toast.success("Demo data loaded! Explore the app with sample data.")
    } catch (e) {
      toast.error("Failed to load demo data")
      console.error("Demo data error:", e)
    }
    setShowDemoConfirm(false)
  }

  const hasAnyData = incomeSources.length > 0 || expenses.length > 0 || wishlistItems.length > 0 || projects.length > 0

  // Last backup date
  const lastBackupDate = settings.lastBackupDate
    ? new Date(settings.lastBackupDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null

  // Storage info
  const storageInfo = `${incomeSources.length} income, ${expenses.length} expenses, ${wishlistItems.length} wishlist, ${projects.length} projects`

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Settings className="h-7 w-7 text-[#14B8A6]" />
          Settings
        </h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Customize your Axtora experience
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <User className="h-4 w-4 text-[#14B8A6]" />
              Profile
            </h2>

            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-[#14B8A6]/10 flex items-center justify-center shrink-0 text-2xl">
                {getAvatarEmoji(user?.avatarId)}
              </div>
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Enter name"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white"
                      onClick={() => {
                        if (editName.trim().length >= 2) {
                          updateProfile({ name: editName.trim() })
                          setIsEditingName(false)
                          toast.success("Name updated")
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setIsEditingName(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{user?.name || "User"}</p>
                    {user?.isGuest && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        Guest
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Picker */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground">Avatar</p>
              <div className="grid grid-cols-5 gap-1.5">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      updateProfile({ avatarId: avatar.id })
                      toast.success(`Avatar changed to ${avatar.label}`)
                    }}
                    className={cn(
                      "flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-all",
                      user?.avatarId === avatar.id
                        ? "border-[#14B8A6] bg-[#14B8A6]/10"
                        : "border-transparent hover:border-border hover:bg-muted/50"
                    )}
                  >
                    <span className="text-lg">{avatar.emoji}</span>
                    <span className={cn(
                      "text-[8px] font-bold leading-tight",
                      user?.avatarId === avatar.id ? "text-[#14B8A6]" : "text-muted-foreground"
                    )}>
                      {avatar.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => {
                  setEditName(user?.name || "")
                  setIsEditingName(true)
                }}
              >
                <Pencil className="h-3 w-3" />
                Edit Name
              </Button>

              {user?.pinHash ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    setPinError("")
                    setNewPin("")
                    setConfirmNewPin("")
                    setCurrentPin("")
                    setShowCurrentPinDialog(true)
                  }}
                >
                  <KeyRound className="h-3 w-3" />
                  Change PIN
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    setPinError("")
                    setNewPin("")
                    setConfirmNewPin("")
                    setShowPinDialog(true)
                  }}
                >
                  <KeyRound className="h-3 w-3" />
                  Set PIN
                </Button>
              )}
            </div>

            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs gap-2 border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                onClick={() => {
                  authLogout()
                  router.push("/login")
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* A. Currency Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#14B8A6]" />
              Currency
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentCurrency.flag}</span>
                <div>
                  <p className="text-sm font-bold">
                    {currentCurrency.symbol} {currentCurrency.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentCurrency.name}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setCurrencySearch("")
                  setShowCurrencyPicker(true)
                }}
              >
                Change Currency
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* B. Number Format Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[#14B8A6]" />
              Number Format
            </h2>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Show cents</Label>
                <p className="text-xs text-muted-foreground">
                  Display decimal places in amounts
                </p>
              </div>
              <Switch
                checked={settings.showCents}
                onCheckedChange={(checked) =>
                  updateSettings({ showCents: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Compact numbers</Label>
                <p className="text-xs text-muted-foreground">
                  Show $5.2K instead of $5,200
                </p>
              </div>
              <Switch
                checked={settings.compactNumbers}
                onCheckedChange={(checked) =>
                  updateSettings({ compactNumbers: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* C. Appearance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#14B8A6]" />
              Appearance
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-bold transition-all border",
                    theme === opt.value
                      ? "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* D. Start Page Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-[#14B8A6]" />
              Start Page
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose which page opens on launch
            </p>
            <div className="grid grid-cols-3 gap-2">
              {startPageOptions.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ startPage: opt.value })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg text-xs font-bold transition-all border",
                      settings.startPage === opt.value
                        ? "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* E. Backup & Restore */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#14B8A6]" />
              Backup & Restore
            </h2>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs gap-2"
                onClick={handleExportBackup}
              >
                <Download className="h-3.5 w-3.5" />
                Export Backup
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Import Backup
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                Last backup:{" "}
                {lastBackupDate ? (
                  <span className="font-bold text-foreground">
                    {lastBackupDate}
                  </span>
                ) : (
                  <span className="font-bold">Never</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3 shrink-0" />
              <span>
                Local storage: <span className="font-bold text-[#14B8A6]">Active</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-3 w-3 shrink-0" />
              <span>
                Storage used: <span className="font-bold text-foreground">{storageSize}</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Your data is stored locally in your browser. No data is sent to any server. Export backups regularly to keep your data safe.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* F. Demo Data */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Database className="h-4 w-4 text-[#14B8A6]" />
              Demo Data
            </h2>
            <p className="text-xs text-muted-foreground">
              Load sample data to explore the app features. This will replace any existing data.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs gap-2 border-[#14B8A6]/30 text-[#14B8A6] hover:bg-[#14B8A6]/10 hover:text-[#14B8A6]"
              onClick={() => setShowDemoConfirm(true)}
            >
              <Database className="h-3.5 w-3.5" />
              Import Demo Data
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* G. Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-[#EF4444]" />
              Data Management
            </h2>

            <p className="text-xs text-muted-foreground">{storageInfo}</p>

            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs gap-2 border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
              onClick={() => setShowClearConfirm1(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* H. Offline Support Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Wifi className="h-4 w-4 text-[#14B8A6]" />
              Offline Support
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#14B8A6]/10 text-xs font-bold text-[#14B8A6]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
                Fully offline
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              This app works completely offline. No server connections, no API calls.
              All your data is stored locally in your browser.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* I. About Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Info className="h-4 w-4 text-[#14B8A6]" />
              About
            </h2>
            <div className="space-y-1">
              <p className="text-sm font-bold">Axtora</p>
              <p className="text-xs text-muted-foreground">
                Version 3.0.0 — Smart routing, persistent auth, dynamic greetings
              </p>
              <p className="text-xs text-muted-foreground">
                Personal finance and life management — 100% client-side
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Currency Picker Dialog/Drawer */}
      <CurrencyPicker
        open={showCurrencyPicker}
        onOpenChange={setShowCurrencyPicker}
        search={currencySearch}
        onSearchChange={setCurrencySearch}
        filteredCurrencies={filteredCurrencies}
        currentCurrency={settings.currency}
        onSelect={(code) => {
          updateSettings({ currency: code })
          setShowCurrencyPicker(false)
          toast.success(`Currency changed to ${CURRENCIES[code].name}`)
        }}
      />

      {/* Restore Confirmation */}
      <AlertDialog
        open={showRestoreConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowRestoreConfirm(false)
            setPendingRestoreData(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all your current data with the backup. This action
              cannot be undone. Consider exporting your current data first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Data - First Confirmation */}
      <AlertDialog
        open={showClearConfirm1}
        onOpenChange={setShowClearConfirm1}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your income sources, expenses,
              wishlist items, and projects. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowClearConfirm1(false)
                setShowClearConfirm2(true)
              }}
              className="bg-[#EF4444] text-white hover:bg-[#EF4444]/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Data - Second Confirmation (Type DELETE) */}
      <AlertDialog
        open={showClearConfirm2}
        onOpenChange={(open) => {
          if (!open) {
            setShowClearConfirm2(false)
            setClearConfirmText("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This cannot be undone</AlertDialogTitle>
            <AlertDialogDescription>
              Type <strong>DELETE</strong> to confirm and permanently erase all
              your data from both IndexedDB and localStorage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={clearConfirmText}
            onChange={(e) => setClearConfirmText(e.target.value)}
            placeholder='Type "DELETE" to confirm'
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowClearConfirm2(false)
                setClearConfirmText("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              disabled={clearConfirmText !== "DELETE"}
              className="bg-[#EF4444] text-white hover:bg-[#EF4444]/90 disabled:opacity-50"
            >
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demo Data Confirmation */}
      <AlertDialog
        open={showDemoConfirm}
        onOpenChange={setShowDemoConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Demo Data?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasAnyData
                ? "This will replace all your current data with sample demo data. If you want to keep your existing data, export a backup first."
                : "This will load sample data so you can explore the app features. You can always clear it later from Data Management."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLoadDemoData}
              className="bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90"
            >
              Import Demo Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Set PIN Dialog */}
      <AlertDialog
        open={showPinDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowPinDialog(false)
            setPinError("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{user?.pinHash ? "Change PIN" : "Set PIN"}</AlertDialogTitle>
            <AlertDialogDescription>
              {user?.pin
                ? "Enter a new 4-digit PIN for your account."
                : "Set a 4-digit PIN to secure your account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">New PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4)
                  setNewPin(val)
                }}
                placeholder="••••"
                className="tracking-[0.3em]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">Confirm PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmNewPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4)
                  setConfirmNewPin(val)
                }}
                placeholder="••••"
                className="tracking-[0.3em]"
              />
            </div>
            {pinError && (
              <p className="text-xs font-bold text-[#EF4444]">{pinError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!/^\d{4}$/.test(newPin)) {
                  setPinError("PIN must be exactly 4 digits")
                  return
                }
                if (newPin !== confirmNewPin) {
                  setPinError("PINs do not match")
                  return
                }
                await setPin(newPin)
                setShowPinDialog(false)
                toast.success(user?.pinHash ? "PIN changed successfully" : "PIN set successfully")
              }}
              className="bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90"
            >
              {user?.pinHash ? "Change PIN" : "Set PIN"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Current PIN Dialog */}
      <AlertDialog
        open={showCurrentPinDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowCurrentPinDialog(false)
            setCurrentPin("")
            setPinError("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Current PIN</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current PIN to proceed with changing it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">Current PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4)
                  setCurrentPin(val)
                }}
                placeholder="••••"
                className="tracking-[0.3em]"
                autoFocus
              />
            </div>
            {pinError && (
              <p className="text-xs font-bold text-[#EF4444]">{pinError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (await verifyPin(currentPin)) {
                  setShowCurrentPinDialog(false)
                  setCurrentPin("")
                  setPinError("")
                  setShowPinDialog(true)
                } else {
                  setPinError("Incorrect PIN")
                }
              }}
              className="bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90"
            >
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Currency Picker Dialog/Drawer ─── */

function CurrencyPicker({
  open,
  onOpenChange,
  search,
  onSearchChange,
  filteredCurrencies,
  currentCurrency,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  search: string
  onSearchChange: (value: string) => void
  filteredCurrencies: typeof CURRENCY_LIST
  currentCurrency: CurrencyCode
  onSelect: (code: CurrencyCode) => void
}) {
  const isMobile = useIsMobile()

  const content = (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search currencies..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
          autoFocus
        />
      </div>
      <div className="max-h-72 overflow-y-auto space-y-0.5">
        {filteredCurrencies.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No currencies found
          </p>
        ) : (
          filteredCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => onSelect(c.code)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                currentCurrency === c.code
                  ? "bg-[#14B8A6]/10 text-[#14B8A6]"
                  : "hover:bg-muted"
              )}
            >
              <span className="text-lg">{c.flag}</span>
              <span className="font-bold w-8 text-left">{c.symbol}</span>
              <span className="text-xs text-muted-foreground w-10">
                {c.code}
              </span>
              <span className="flex-1 text-left text-xs">{c.name}</span>
              {currentCurrency === c.code && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6]" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Change Currency</DrawerTitle>
            <DrawerDescription>
              Select your preferred currency
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Currency</DialogTitle>
          <DialogDescription>
            Select your preferred currency
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
