"use client"

import { useFinanceStore } from "@/store/finance-store"
import {
  formatDueDate,
  getPriorityInfo,
  getCategoryInfo_project,
} from "@/lib/finance-helpers"
import { useFormatCurrency } from "@/hooks/use-format-currency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { EmptyState } from "@/components/empty-state"
import { AddProjectItemDialog } from "@/components/add-project-item-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { EditProjectItemDialog } from "@/components/edit-project-item-dialog"
import { ImagePreviewModal } from "@/components/image-preview-modal"
import { ItemThumbnail } from "@/components/item-thumbnail"
import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Target,
  ChevronRight,
  CheckCircle2,
  Circle,
  Search,
  Calendar,
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Pencil,
  Copy,
  AlertTriangle,
  Filter,
  StickyNote,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SortOption = "priority" | "dueDate" | "progress" | "budget"
type StatusFilter = "all" | "not-started" | "in-progress" | "on-hold" | "completed"

const SORT_LABELS: Record<SortOption, { label: string; icon: React.ElementType }> = {
  priority: { label: "Priority", icon: AlertCircle },
  dueDate: { label: "Due date", icon: Clock },
  progress: { label: "Progress", icon: CheckCircle },
  budget: { label: "Budget", icon: ArrowUpDown },
}

const STATUS_FILTER_OPTIONS: Record<StatusFilter, { label: string }> = {
  all: { label: "All" },
  "not-started": { label: "Not Started" },
  "in-progress": { label: "In Progress" },
  "on-hold": { label: "On Hold" },
  completed: { label: "Completed" },
}

const projectStatusInfo: Record<string, { label: string; color: string; bgColor: string; darkBgColor: string }> = {
  "not-started": { label: "Not Started", color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-100", darkBgColor: "dark:bg-gray-800/30" },
  "in-progress": { label: "In Progress", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100", darkBgColor: "dark:bg-blue-900/30" },
  "on-hold": { label: "On Hold", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100", darkBgColor: "dark:bg-amber-900/30" },
  "completed": { label: "Completed", color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-100", darkBgColor: "dark:bg-teal-900/30" },
}

function daysUntilDue(dateStr: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(dateStr)
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.ceil((targetDate.getTime() - today.getTime()) / 86400000)
}

function sortProjects(
  projects: ReturnType<typeof useFinanceStore.getState>["projects"],
  sortBy: SortOption,
  getProjectProgress: (id: string) => number,
  getProjectTotal: (id: string) => number,
) {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...projects].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case "progress":
        return getProjectProgress(a.id) - getProjectProgress(b.id)
      case "budget":
        return getProjectTotal(b.id) - getProjectTotal(a.id)
      default:
        return 0
    }
  })
}

export function ProjectsSection() {
  const projects = useFinanceStore((s) => s.projects)
  const deleteProject = useFinanceStore((s) => s.deleteProject)
  const deleteProjectItem = useFinanceStore((s) => s.deleteProjectItem)
  const toggleProjectItemCompleted = useFinanceStore((s) => s.toggleProjectItemCompleted)
  const duplicateProject = useFinanceStore((s) => s.duplicateProject)
  const markProjectComplete = useFinanceStore((s) => s.markProjectComplete)
  const fmt = useFormatCurrency()

  // Local helper functions that use the projects array directly
  const getProjectTotal = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return 0
    return project.items.reduce((sum, i) => sum + i.cost * (i.quantity || 1), 0)
  }, [projects])

  const getProjectProgress = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project || project.items.length === 0) return 0
    return Math.round((project.items.filter((i) => i.completed).length / project.items.length) * 100)
  }, [projects])

  const getProjectSpent = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return 0
    return project.items.filter((i) => i.completed).reduce((sum, i) => sum + i.cost * (i.quantity || 1), 0)
  }, [projects])

  const getCompletedItemsCount = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return 0
    return project.items.filter((i) => i.completed).length
  }, [projects])

  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<{
    projectId: string
    itemId: string
  } | null>(null)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("priority")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)
  const [editItemId, setEditItemId] = useState<{ projectId: string; itemId: string } | null>(null)

  const expanded = expandedProject
    ? projects.find((p) => p.id === expandedProject)
    : null

  const filteredProjects = useMemo(() => {
    let filtered = projects
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => {
        const status = p.status || "not-started"
        return status === statusFilter
      })
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }
    return sortProjects(filtered, sortBy, getProjectProgress, getProjectTotal)
  }, [projects, searchQuery, sortBy, statusFilter, getProjectProgress, getProjectTotal])

  // Summary stats
  const totalBudget = projects.reduce((s, p) => s + getProjectTotal(p.id), 0)
  const totalSpent = projects.reduce((s, p) => s + getProjectSpent(p.id), 0)

  // Status breakdown
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "not-started": 0,
      "in-progress": 0,
      "on-hold": 0,
      completed: 0,
    }
    projects.forEach((p) => {
      const status = p.status || "not-started"
      if (counts[status] !== undefined) counts[status]++
    })
    return counts
  }, [projects])

  const activeProjectsCount = projects.filter((p) => {
    const status = p.status || "not-started"
    return status !== "completed"
  }).length

  // Overdue count
  const overdueCount = useMemo(() => {
    return projects.filter((p) => {
      if (!p.dueDate) return false
      const status = p.status || "not-started"
      if (status === "completed") return false
      return daysUntilDue(p.dueDate) < 0
    }).length
  }, [projects])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Projects & Goals</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {activeProjectsCount} active · {statusCounts.completed} done
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>

      {/* Detail View */}
      {expanded ? (
        <ProjectDetailView
          project={expanded}
          onBack={() => setExpandedProject(null)}
          onDeleteProject={(id) => setDeleteId(id)}
          onDeleteItem={(pid, iid) => setDeleteItemId({ projectId: pid, itemId: iid })}
          onToggleItem={toggleProjectItemCompleted}
          onAddItem={() => setShowAddItem(true)}
          onEditProject={(id) => setEditProjectId(id)}
          onEditItem={(pid, iid) => setEditItemId({ projectId: pid, itemId: iid })}
          onDuplicateProject={(id) => { duplicateProject(id); toast.success("Project duplicated"); setExpandedProject(null) }}
          onMarkComplete={(id) => { markProjectComplete(id); toast.success("Project marked as complete") }}
          getProjectTotal={getProjectTotal}
          getProjectProgress={getProjectProgress}
          getProjectSpent={getProjectSpent}
          getCompletedItemsCount={getCompletedItemsCount}
          onPreviewImage={(url, title) => setPreviewImage({ url, title })}
        />
      ) : (
        <>
          {/* Search + Filter + Sort row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={statusFilter !== "all" ? "default" : "outline"}
                  size="sm"
                  className="h-9 gap-1.5 text-xs shrink-0"
                >
                  <Filter className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {STATUS_FILTER_OPTIONS[statusFilter].label}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.entries(STATUS_FILTER_OPTIONS) as [StatusFilter, typeof STATUS_FILTER_OPTIONS[StatusFilter]][]).map(
                  ([key, { label }]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      className={cn(statusFilter === key && "bg-accent")}
                    >
                      {label}
                    </DropdownMenuItem>
                  )
                )}
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

          {/* Budget overview */}
          <div className="rounded-xl bg-card border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-muted-foreground">Total Budget</p>
              <p className="text-lg font-extrabold">{fmt(totalBudget)}</p>
            </div>
            {/* Spent vs Remaining bar */}
            {totalBudget > 0 && (
              <>
                <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#EF4444]/60 rounded-l-full transition-all"
                    style={{ width: `${Math.round((totalSpent / totalBudget) * 100)}%` }}
                  />
                  <div
                    className="h-full bg-[#14B8A6]/60 rounded-r-full transition-all"
                    style={{ width: `${Math.round(((totalBudget - totalSpent) / totalBudget) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#EF4444]/60" />
                    <span className="text-[11px] text-muted-foreground">
                      Spent {fmt(totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#14B8A6]/60" />
                    <span className="text-[11px] text-muted-foreground">
                      Left {fmt(totalBudget - totalSpent)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Active projects + status breakdown */}
            <div className="mt-3 pt-3 border-t border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-muted-foreground">
                </span>
                {statusCounts["in-progress"] > 0 && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                    {statusCounts["in-progress"]} in progress
                  </span>
                )}
                {statusCounts["not-started"] > 0 && (
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">
                    {statusCounts["not-started"]} not started
                  </span>
                )}
                {statusCounts["on-hold"] > 0 && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                    {statusCounts["on-hold"]} on hold
                  </span>
                )}
              </div>
              {overdueCount > 0 && (
                <div className="flex items-center gap-1 text-[#EF4444]">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-[11px] font-bold">{overdueCount} overdue</span>
                </div>
              )}
            </div>
          </div>

          {/* Project List */}
          {filteredProjects.length === 0 ? (
            projects.length === 0 ? (
              <EmptyState
                icon={<Target className="h-7 w-7 text-violet-500" />}
                title="No projects yet"
                description="Plan and budget for goals like home improvements, travel, or savings targets. Break them into items and track progress."
                action={
                  <Button onClick={() => setShowAdd(true)} className="bg-violet-600 hover:bg-violet-600/90 text-white font-bold">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create project
                  </Button>
                }
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-bold text-sm">No matches</h3>
                  <p className="text-muted-foreground text-xs mt-1">Try a different search or filter</p>
                </CardContent>
              </Card>
            )
          ) : (
            <div className="space-y-1.5">
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onClick={() => setExpandedProject(project.id)}
                    onDelete={(id) => setDeleteId(id)}
                    onEdit={(id) => setEditProjectId(id)}
                    onDuplicate={(id) => { duplicateProject(id); toast.success("Project duplicated") }}
                    onMarkComplete={(id) => { markProjectComplete(id); toast.success("Project marked as complete") }}
                    onPreviewImage={(url, title) => setPreviewImage({ url, title })}
                    getProjectTotal={getProjectTotal}
                    getProjectProgress={getProjectProgress}
                    getProjectSpent={getProjectSpent}
                    getCompletedItemsCount={getCompletedItemsCount}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <AddProjectDialog open={showAdd} onOpenChange={setShowAdd} />
      {expandedProject && (
        <AddProjectItemDialog
          open={showAddItem}
          onOpenChange={setShowAddItem}
          projectId={expandedProject}
        />
      )}
      {editProjectId && (
        <EditProjectDialog
          open={!!editProjectId}
          onOpenChange={(open) => { if (!open) setEditProjectId(null) }}
          projectId={editProjectId}
        />
      )}
      {editItemId && (
        <EditProjectItemDialog
          open={!!editItemId}
          onOpenChange={(open) => { if (!open) setEditItemId(null) }}
          projectId={editItemId.projectId}
          itemId={editItemId.itemId}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteProject(deleteId)
                  setExpandedProject(null)
                  toast.success("Project deleted")
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

      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this item from the project?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteItemId) {
                  deleteProjectItem(deleteItemId.projectId, deleteItemId.itemId)
                  toast.success("Item removed")
                  setDeleteItemId(null)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewImage && (
        <ImagePreviewModal
          open={!!previewImage}
          onOpenChange={(open) => {
            if (!open) setPreviewImage(null)
          }}
          imageUrl={previewImage.url}
          title={previewImage.title}
        />
      )}
    </div>
  )
}

/* ─── Enhanced Project Row ─── */

function ProjectRow({
  project,
  onClick,
  onDelete,
  onEdit,
  onDuplicate,
  onMarkComplete,
  onPreviewImage,
  getProjectTotal,
  getProjectProgress,
  getProjectSpent,
  getCompletedItemsCount,
}: {
  project: ReturnType<typeof useFinanceStore.getState>["projects"][0]
  onClick: () => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onMarkComplete: (id: string) => void
  onPreviewImage: (url: string, title: string) => void
  getProjectTotal: (id: string) => number
  getProjectProgress: (id: string) => number
  getProjectSpent: (id: string) => number
  getCompletedItemsCount: (id: string) => number
}) {
  const fmt = useFormatCurrency()
  const progress = getProjectProgress(project.id)
  const total = getProjectTotal(project.id)
  const spent = getProjectSpent(project.id)
  const completedCount = getCompletedItemsCount(project.id)
  const catInfo = getCategoryInfo_project(project.category)
  const priorityInfo = getPriorityInfo(project.priority)
  const CatIcon = catInfo.icon
  const isComplete = progress === 100 || project.status === "completed"
  const status = project.status || "not-started"
  const statusInfo = projectStatusInfo[status]
  const isOverdue = project.dueDate && status !== "completed" && daysUntilDue(project.dueDate) < 0
  const days = project.dueDate ? daysUntilDue(project.dueDate) : null

  const barColor = isComplete
    ? "bg-teal-500"
    : progress >= 60
    ? "bg-primary"
    : "bg-primary/50"

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-card border cursor-pointer transition-all active:scale-[0.99] group",
          isComplete
            ? "border-teal-200/50 dark:border-teal-800/30 bg-teal-50/30 dark:bg-teal-950/10"
            : "border-border/50 hover:border-border"
        )}
      >
        {/* Category Icon */}
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
          isComplete
            ? "bg-teal-100 dark:bg-teal-900/30"
            : cn(catInfo.bgColor, catInfo.darkBgColor)
        )}>
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-[#14B8A6]" />
          ) : (
            <CatIcon className={cn("h-4 w-4", catInfo.color)} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-sm font-bold truncate",
              isComplete && "text-[#14B8A6]"
            )}>
              {project.name}
            </span>
            {/* Status badge (show if not "in-progress") */}
            {status !== "in-progress" && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1.5 py-0 h-4 rounded-full border-0",
                  statusInfo.bgColor, statusInfo.darkBgColor, statusInfo.color
                )}
              >
                {statusInfo.label}
              </Badge>
            )}
            {/* Overdue warning */}
            {isOverdue && (
              <AlertTriangle className="h-3 w-3 text-[#EF4444] shrink-0" />
            )}
            {!isComplete && status === "in-progress" && (
              <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", priorityInfo.dotColor)} />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={cn(
              "text-[11px] shrink-0 tabular-nums font-bold",
              isComplete ? "text-[#14B8A6]" : "text-muted-foreground"
            )}>
              {progress}%
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-muted-foreground">
              {completedCount}/{project.items.length} items
            </span>
            {project.dueDate && (
              <span className={cn(
                "text-[11px] flex items-center gap-0.5",
                isOverdue ? "text-[#EF4444] font-bold" : "text-muted-foreground"
              )}>
                <Calendar className="h-2.5 w-2.5" />
                {isOverdue
                  ? "Overdue!"
                  : days !== null && days <= 7
                  ? `${days}d left`
                  : formatDueDate(project.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Amount & menu */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className={cn(
              "text-sm font-bold",
              isComplete && "text-[#14B8A6]"
            )}>
              {fmt(spent)}
            </p>
            <p className="text-[11px] text-muted-foreground">{fmt(total)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 hover:bg-muted rounded-md transition-colors opacity-60 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(project.id) }}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              {!isComplete && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkComplete(project.id) }}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(project.id) }}>
                <Copy className="h-3.5 w-3.5 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {project.coverImage && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreviewImage(project.coverImage!, project.name) }}>
                  <ImageIcon className="h-3.5 w-3.5 mr-2" />
                  View Cover Image
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(project.id) }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Enhanced Detail View ─── */

function ProjectDetailView({
  project,
  onBack,
  onDeleteProject,
  onDeleteItem,
  onToggleItem,
  onAddItem,
  onEditProject,
  onEditItem,
  onDuplicateProject,
  onMarkComplete,
  getProjectTotal,
  getProjectProgress,
  getProjectSpent,
  getCompletedItemsCount,
  onPreviewImage,
}: {
  project: ReturnType<typeof useFinanceStore.getState>["projects"][0]
  onBack: () => void
  onDeleteProject: (id: string) => void
  onDeleteItem: (projectId: string, itemId: string) => void
  onToggleItem: (projectId: string, itemId: string) => void
  onAddItem: () => void
  onEditProject: (id: string) => void
  onEditItem: (projectId: string, itemId: string) => void
  onDuplicateProject: (id: string) => void
  onMarkComplete: (id: string) => void
  getProjectTotal: (id: string) => number
  getProjectProgress: (id: string) => number
  getProjectSpent: (id: string) => number
  getCompletedItemsCount: (id: string) => number
  onPreviewImage: (url: string, title: string) => void
}) {
  const fmt = useFormatCurrency()
  const total = getProjectTotal(project.id)
  const progress = getProjectProgress(project.id)
  const spent = getProjectSpent(project.id)
  const remaining = total - spent
  const completedCount = getCompletedItemsCount(project.id)
  const catInfo = getCategoryInfo_project(project.category)
  const priorityInfo = getPriorityInfo(project.priority)
  const CatIcon = catInfo.icon
  const isComplete = progress === 100 || project.status === "completed"
  const status = project.status || "not-started"
  const statusInfo = projectStatusInfo[status]
  const isOverdue = project.dueDate && status !== "completed" && daysUntilDue(project.dueDate) < 0
  const days = project.dueDate ? daysUntilDue(project.dueDate) : null

  const barColor = isComplete
    ? "bg-teal-500"
    : progress >= 60
    ? "bg-primary"
    : "bg-primary/60"

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.15 }}
    >
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Projects
        </button>

        {/* Header Card */}
        <Card className={cn(
          "border-border/50",
          isComplete && "border-teal-200/50 dark:border-teal-800/30"
        )}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  isComplete
                    ? "bg-teal-100 dark:bg-teal-900/30"
                    : cn(catInfo.bgColor, catInfo.darkBgColor)
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-[#14B8A6]" />
                  ) : (
                    <CatIcon className={cn("h-5 w-5", catInfo.color)} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-extrabold leading-tight">{project.name}</h2>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:bg-muted rounded-md transition-colors shrink-0">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditProject(project.id)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit project
                  </DropdownMenuItem>
                  {!isComplete && (
                    <DropdownMenuItem onClick={() => onMarkComplete(project.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onDuplicateProject(project.id)}>
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Duplicate Project
                  </DropdownMenuItem>
                  {project.coverImage && (
                    <DropdownMenuItem onClick={() => onPreviewImage(project.coverImage!, project.name)}>
                      <ImageIcon className="h-3.5 w-3.5 mr-2" />
                      View cover image
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteProject(project.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status badge + Mark Complete button */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0.5 h-5 rounded-full border-0",
                  statusInfo.bgColor, statusInfo.darkBgColor, statusInfo.color
                )}
              >
                {statusInfo.label}
              </Badge>
              {!isComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1 px-2"
                  onClick={() => onMarkComplete(project.id)}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Mark Complete
                </Button>
              )}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {!isComplete && (
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                  priorityInfo.bgColor, priorityInfo.darkBgColor, priorityInfo.color
                )}>
                  <span className={cn("h-1 w-1 rounded-full", priorityInfo.dotColor)} />
                  {priorityInfo.label}
                </span>
              )}
              {project.dueDate && (
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                  isOverdue
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  <Calendar className="h-2.5 w-2.5" />
                  {isOverdue
                    ? `Overdue! (${formatDueDate(project.dueDate)})`
                    : days !== null && days <= 7
                    ? `${days}d left (${formatDueDate(project.dueDate)})`
                    : formatDueDate(project.dueDate)}
                </span>
              )}
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                isComplete
                  ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                  : cn(catInfo.bgColor, catInfo.darkBgColor, catInfo.color)
              )}>
                {isComplete ? (
                  <Sparkles className="h-2.5 w-2.5" />
                ) : (
                  <CatIcon className="h-2.5 w-2.5" />
                )}
                {isComplete ? "Completed" : catInfo.label}
              </span>
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                <StickyNote className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{project.notes}</p>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className={cn(
                  "text-xs font-bold",
                  isComplete && "text-[#14B8A6]"
                )}>
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Budget strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</p>
                <p className="text-sm font-bold mt-0.5">{fmt(total)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spent</p>
                <p className="text-sm font-bold mt-0.5 text-[#EF4444]">{fmt(spent)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
                <p className="text-sm font-bold mt-0.5 text-[#14B8A6]">{fmt(remaining)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Items</h3>
                <span className="text-[11px] text-muted-foreground">
                  {completedCount}/{project.items.length}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddItem}
                className="h-7 text-[11px] gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>

            {project.items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">
                  No items yet. Add items to track progress.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {project.items.map((item) => {
                    const qty = item.quantity || 1
                    const itemTotal = item.cost * qty
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2.5 py-2 border-b border-border/30 last:border-0 group"
                      >
                        <button
                          onClick={() => onToggleItem(project.id, item.id)}
                          className="shrink-0"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                          ) : (
                            <Circle className="h-4.5 w-4.5 text-muted-foreground/30 hover:text-muted-foreground" />
                          )}
                        </button>

                        <ItemThumbnail
                          imageUrl={item.imageUrl}
                          name={item.name}
                          className="h-8 w-8"
                          iconClassName="h-3.5 w-3.5"
                          onClick={item.imageUrl ? () => onPreviewImage(item.imageUrl!, item.name) : undefined}
                        />

                        <div className="flex-1 min-w-0">
                          <span
                            className={cn(
                              "text-sm block truncate font-bold",
                              item.completed && "line-through text-muted-foreground"
                            )}
                          >
                            {item.name}
                          </span>
                          {qty > 1 && (
                            <span className="text-[11px] text-muted-foreground">
                              {qty}x {fmt(item.cost)} each
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-[11px] text-muted-foreground block truncate">
                              {item.notes}
                            </span>
                          )}
                        </div>

                        <span
                          className={cn(
                            "text-sm font-bold shrink-0 tabular-nums",
                            item.completed && "text-muted-foreground line-through"
                          )}
                        >
                          {fmt(itemTotal)}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-muted rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.imageUrl && (
                              <DropdownMenuItem onClick={() => onPreviewImage(item.imageUrl!, item.name)}>
                                <ImageIcon className="h-3.5 w-3.5 mr-2" />
                                View image
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEditItem(project.id, item.id)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteItem(project.id, item.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
