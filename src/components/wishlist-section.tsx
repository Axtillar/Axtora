"use client"

import { useFinanceStore } from "@/store/finance-store"
import { useFormatCurrency } from "@/hooks/use-format-currency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddWishlistDialog } from "@/components/add-wishlist-dialog"
import { EmptyState } from "@/components/empty-state"
import { EditWishlistDialog } from "@/components/edit-wishlist-dialog"
import { ImagePreviewModal } from "@/components/image-preview-modal"
import { ItemThumbnail } from "@/components/item-thumbnail"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Heart, Trash2, ShoppingBag, CheckCircle2, Circle, Pencil,
  Link as LinkIcon, Search, MoreHorizontal, ArrowUpDown, DollarSign,
  Package, RotateCcw, Copy, Laptop, Shirt, Home, Plane, Gamepad2,
  Dumbbell, BookOpen, Filter, Check,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Category & Priority Maps ───────────────────────────────────────────────

const wishlistCategories: Record<string, { label: string; icon: React.ElementType; color: string; barColor: string }> = {
  tech: { label: "Tech", icon: Laptop, color: "text-violet-600 dark:text-violet-400", barColor: "bg-violet-500" },
  fashion: { label: "Fashion", icon: Shirt, color: "text-pink-600 dark:text-pink-400", barColor: "bg-pink-500" },
  home: { label: "Home", icon: Home, color: "text-orange-600 dark:text-orange-400", barColor: "bg-orange-500" },
  travel: { label: "Travel", icon: Plane, color: "text-sky-600 dark:text-sky-400", barColor: "bg-sky-500" },
  entertainment: { label: "Entertainment", icon: Gamepad2, color: "text-purple-600 dark:text-purple-400", barColor: "bg-purple-500" },
  fitness: { label: "Fitness", icon: Dumbbell, color: "text-teal-600 dark:text-teal-400", barColor: "bg-teal-500" },
  books: { label: "Books", icon: BookOpen, color: "text-amber-600 dark:text-amber-400", barColor: "bg-amber-500" },
  other: { label: "Other", icon: Package, color: "text-gray-600 dark:text-gray-400", barColor: "bg-gray-500" },
}

const wishlistPriority: Record<string, { label: string; color: string; dotColor: string }> = {
  high: { label: "High", color: "text-red-600 dark:text-red-400", dotColor: "bg-red-500" },
  medium: { label: "Medium", color: "text-amber-600 dark:text-amber-400", dotColor: "bg-amber-500" },
  low: { label: "Low", color: "text-teal-600 dark:text-teal-400", dotColor: "bg-teal-500" },
}

// ─── Sort & Filter Types ────────────────────────────────────────────────────

type SortOption = "date" | "price" | "name" | "priority"

const SORT_LABELS: Record<SortOption, { label: string; icon: React.ElementType }> = {
  date: { label: "Date added", icon: ArrowUpDown },
  price: { label: "Price", icon: DollarSign },
  name: { label: "Name", icon: Search },
  priority: { label: "Priority", icon: Heart },
}

type FilterOption = "all" | "high" | "medium" | "low" | "tech" | "fashion" | "home" | "travel" | "entertainment" | "fitness" | "books" | "other"

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "⬤ High Priority" },
  { value: "medium", label: "⬤ Medium Priority" },
  { value: "low", label: "⬤ Low Priority" },
  { value: "tech", label: "Tech" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home" },
  { value: "travel", label: "Travel" },
  { value: "entertainment", label: "Entertainment" },
  { value: "fitness", label: "Fitness" },
  { value: "books", label: "Books" },
  { value: "other", label: "Other" },
]

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

// ─── Component ──────────────────────────────────────────────────────────────

export function WishlistSection() {
  const wishlistItems = useFinanceStore((s) => s.wishlistItems)
  const toggleWishlistPurchased = useFinanceStore((s) => s.toggleWishlistPurchased)
  const deleteWishlistItem = useFinanceStore((s) => s.deleteWishlistItem)
  const duplicateWishlistItem = useFinanceStore((s) => s.duplicateWishlistItem)
  const incomeSources = useFinanceStore((s) => s.incomeSources)
  const expenses = useFinanceStore((s) => s.expenses)
  const fmt = useFormatCurrency()

  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const wishlistTotal = useMemo(() => wishlistItems.filter((w) => !w.purchased).reduce((sum, w) => sum + w.price, 0), [wishlistItems])

  const availableBalance = useMemo(() => {
    const totalIncome = incomeSources.filter((s) => s.isActive).reduce((sum, s) => {
      switch (s.frequency) {
        case "weekly": return sum + s.amount * 4.33
        case "yearly": return sum + s.amount / 12
        case "monthly": return sum + s.amount
        case "one-time": return sum + s.amount
        default: return sum + s.amount
      }
    }, 0)
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    const totalExpenses = expenses.filter((e) => e.date >= monthStart).reduce((sum, e) => sum + e.amount, 0)
    return totalIncome - totalExpenses
  }, [incomeSources, expenses])

  const purchasedTotal = useMemo(
    () => wishlistItems.filter((w) => w.purchased).reduce((s, w) => s + w.price, 0),
    [wishlistItems]
  )

  const allTotal = useMemo(
    () => wishlistItems.reduce((s, w) => s + w.price, 0),
    [wishlistItems]
  )

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    wishlistItems.forEach((item) => {
      const cat = item.category || "other"
      map[cat] = (map[cat] || 0) + item.price
    })
    return Object.entries(map)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
  }, [wishlistItems])

  // Sorted & filtered
  const sortedItems = useMemo(() => {
    let filtered = wishlistItems
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((w) => w.name.toLowerCase().includes(q))
    }
    if (filterBy !== "all") {
      if (["high", "medium", "low"].includes(filterBy)) {
        filtered = filtered.filter((w) => w.priority === filterBy)
      } else {
        filtered = filtered.filter((w) => w.category === filterBy)
      }
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "price":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        case "priority": {
          const pa = a.priority ? PRIORITY_ORDER[a.priority] : 99
          const pb = b.priority ? PRIORITY_ORDER[b.priority] : 99
          return pa - pb
        }
        default:
          return 0
      }
    })
  }, [wishlistItems, searchQuery, sortBy, filterBy])

  const unpurchased = sortedItems.filter((w) => !w.purchased)
  const purchased = sortedItems.filter((w) => w.purchased)

  const canAfford = availableBalance >= wishlistTotal

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {unpurchased.length} items · {fmt(wishlistTotal)}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {/* Overview Card */}
      {unpurchased.length > 0 && (
        <div className="rounded-xl bg-pink-500/5 dark:bg-pink-500/10 border border-pink-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total wishlist value</p>
                <p className="text-lg font-extrabold text-pink-600 dark:text-pink-400">{fmt(wishlistTotal)}</p>
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-[11px] text-muted-foreground">
                {purchased.length} purchased · {fmt(purchasedTotal)}
              </p>
              <p className={cn("text-[11px] font-bold", canAfford ? "text-[#14B8A6]" : "text-amber-600 dark:text-amber-400")}>
                {canAfford
                  ? "You can afford it all! ✓"
                  : `${fmt(wishlistTotal - availableBalance)} more needed`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown Mini-Chart */}
      {categoryBreakdown.length > 0 && allTotal > 0 && (
        <div className="rounded-xl bg-card border border-border/50 p-3 space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Category Breakdown</p>
          <div className="space-y-1.5">
            {categoryBreakdown.map(({ key, value }) => {
              const cat = wishlistCategories[key]
              const pct = allTotal > 0 ? (value / allTotal) * 100 : 0
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn("text-[11px] w-20 truncate flex items-center gap-1 font-bold", cat?.color || "text-gray-600 dark:text-gray-400")}>
                    {cat && <cat.icon className="h-3 w-3" />}
                    {cat?.label || key}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", cat?.barColor || "bg-gray-400")}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground w-14 text-right shrink-0 font-bold">
                    {fmt(value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Search + Sort + Filter */}
      {wishlistItems.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs shrink-0">
                <Filter className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {filterBy === "all" ? "Filter" : FILTER_OPTIONS.find((f) => f.value === filterBy)?.label}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {FILTER_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setFilterBy(opt.value)}
                  className={cn(filterBy === opt.value && "bg-accent")}
                >
                  {filterBy === opt.value && <Check className="h-3 w-3 mr-1.5" />}
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs shrink-0">
                <ArrowUpDown className="h-3 w-3" />
                <span className="hidden sm:inline">{SORT_LABELS[sortBy].label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.entries(SORT_LABELS) as [SortOption, typeof SORT_LABELS[SortOption]][]).map(
                ([key, { label, icon: Icon }]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={cn(sortBy === key && "bg-accent")}
                  >
                    <Icon className="h-3.5 w-3.5 mr-2" />
                    {label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Active filter indicator */}
      {filterBy !== "all" && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0.5">
            Filtered: {FILTER_OPTIONS.find((f) => f.value === filterBy)?.label}
            <button
              onClick={() => setFilterBy("all")}
              className="ml-0.5 hover:text-destructive transition-colors"
            >
              ×
            </button>
          </Badge>
        </div>
      )}

      {/* ── Unpurchased Items ──────────────────────────────────────────────── */}
      {unpurchased.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Still Want · {fmt(unpurchased.reduce((s, w) => s + w.price, 0))}
          </h3>
          <div className="space-y-1.5">
            <AnimatePresence>
              {unpurchased.map((item) => {
                const isExpanded = expandedId === item.id
                const catInfo = item.category ? wishlistCategories[item.category] : null
                const priInfo = item.priority ? wishlistPriority[item.priority] : null
                const sharePct = wishlistTotal > 0 ? (item.price / wishlistTotal) * 100 : 0

                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}>
                    <div
                      className={cn(
                        "rounded-xl bg-card border transition-all group",
                        isExpanded ? "border-pink-200/60 dark:border-pink-800/30" : "border-border/50 hover:border-border"
                      )}
                    >
                      {/* Main Row */}
                      <div className="flex items-center gap-2.5 p-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlistPurchased(item.id); toast.success("Marked as purchased!") }}
                          className="shrink-0"
                        >
                          <Circle className="h-4.5 w-4.5 text-muted-foreground/30 hover:text-muted-foreground transition-colors" />
                        </button>
                        <div onClick={(e) => e.stopPropagation()}>
                          <ItemThumbnail
                            imageUrl={item.imageUrl}
                            name={item.name}
                            className="h-9 w-9"
                            fallbackIcon={ShoppingBag}
                            onClick={item.imageUrl ? () => setPreviewImage({ url: item.imageUrl!, title: item.name }) : undefined}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold truncate">{item.name}</p>
                            {item.link && (
                              <LinkIcon className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                            )}
                            {priInfo && (
                              <span className={cn("h-2 w-2 rounded-full shrink-0", priInfo.dotColor)} />
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold shrink-0">{fmt(item.price)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 hover:bg-muted rounded-md transition-colors shrink-0 opacity-60 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditId(item.id)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { duplicateWishlistItem(item.id); toast.success("Item duplicated") }}>
                              <Copy className="h-3.5 w-3.5 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { toggleWishlistPurchased(item.id); toast.success("Marked as purchased!") }}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                              Mark purchased
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(item.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-0 space-y-2.5 border-t border-border/30 mt-0">
                              <div className="pt-2.5 space-y-2">
                                {/* Notes */}
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">{item.notes}</p>
                                )}

                                {/* Badges row */}
                                <div className="flex flex-wrap gap-1.5">
                                  {priInfo && (
                                    <Badge variant="outline" className={cn("text-[10px] h-5 gap-1 px-1.5", priInfo.color)}>
                                      <span className={cn("h-1.5 w-1.5 rounded-full", priInfo.dotColor)} />
                                      {priInfo.label}
                                    </Badge>
                                  )}
                                  {catInfo && (
                                    <Badge variant="outline" className={cn("text-[10px] h-5 gap-1 px-1.5", catInfo.color)}>
                                      <catInfo.icon className="h-3 w-3" />
                                      {catInfo.label}
                                    </Badge>
                                  )}
                                </div>

                                {/* Link */}
                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <LinkIcon className="h-3 w-3" /> {item.link}
                                  </a>
                                )}

                                {/* Share of total */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">Share of total</span>
                                    <span className="text-[10px] font-medium">{sharePct.toFixed(1)}%</span>
                                  </div>
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full bg-pink-500"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${sharePct}%` }}
                                      transition={{ duration: 0.4, ease: "easeOut" }}
                                    />
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[11px] gap-1"
                                    onClick={(e) => { e.stopPropagation(); setEditId(item.id) }}
                                  >
                                    <Pencil className="h-3 w-3" /> Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[11px] gap-1"
                                    onClick={(e) => { e.stopPropagation(); duplicateWishlistItem(item.id); toast.success("Item duplicated") }}
                                  >
                                    <Copy className="h-3 w-3" /> Duplicate
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[11px] gap-1"
                                    onClick={(e) => { e.stopPropagation(); toggleWishlistPurchased(item.id); toast.success("Marked as purchased!") }}
                                  >
                                    <CheckCircle2 className="h-3 w-3" /> Purchase
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[11px] gap-1 text-destructive hover:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}
                                  >
                                    <Trash2 className="h-3 w-3" /> Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Purchased Items ────────────────────────────────────────────────── */}
      {purchased.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Purchased · {fmt(purchasedTotal)} spent
          </h3>
          <div className="space-y-1.5">
            <AnimatePresence>
              {purchased.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-teal-200/40 dark:border-teal-800/20 opacity-70 group">
                    <button
                      onClick={() => { toggleWishlistPurchased(item.id); toast.success("Moved back to wishlist") }}
                      className="shrink-0"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 text-[#14B8A6]" />
                    </button>
                    <ItemThumbnail
                      imageUrl={item.imageUrl}
                      name={item.name}
                      className="h-9 w-9 opacity-70"
                      fallbackIcon={ShoppingBag}
                      onClick={item.imageUrl ? () => setPreviewImage({ url: item.imageUrl!, title: item.name }) : undefined}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-through text-muted-foreground truncate font-bold">{item.name}</p>
                      {item.purchasedDate && (
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">Purchased {item.purchasedDate}</p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0 font-bold">{fmt(item.price)}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 hover:bg-muted rounded-md transition-colors shrink-0 opacity-60 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditId(item.id)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { toggleWishlistPurchased(item.id); toast.success("Moved back to wishlist") }}>
                          <RotateCcw className="h-3.5 w-3.5 mr-2" />
                          Unmark purchased
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(item.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 && (
        <EmptyState
          icon={<Heart className="h-7 w-7 text-pink-500" />}
          title="Your wishlist is empty"
          description="Save items you want to buy — track prices, set priorities, and see what you can afford."
          action={
            <Button onClick={() => setShowAdd(true)} className="bg-pink-600 hover:bg-pink-600/90 text-white font-bold">
              <Plus className="h-4 w-4 mr-1.5" />
              Add to wishlist
            </Button>
          }
        />
      )}

      {/* No results for filter */}
      {wishlistItems.length > 0 && sortedItems.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-xs text-muted-foreground">No items match your filter</p>
            <Button variant="link" size="sm" className="mt-1 text-xs" onClick={() => setFilterBy("all")}>
              Clear filter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddWishlistDialog open={showAdd} onOpenChange={setShowAdd} />
      {editId && <EditWishlistDialog open={!!editId} onOpenChange={(open) => { if (!open) setEditId(null) }} itemId={editId} />}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>Remove this from your wishlist?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteWishlistItem(deleteId)
                  toast.success("Item removed")
                  setDeleteId(null)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {previewImage && <ImagePreviewModal open={!!previewImage} onOpenChange={(open) => { if (!open) setPreviewImage(null) }} imageUrl={previewImage.url} title={previewImage.title} />}
    </div>
  )
}
