"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore, type ProjectPriority, type ProjectCategory } from "@/store/finance-store"
import {
  PROJECT_CATEGORIES,
  PROJECT_PRIORITIES,
  getCategoryInfo_project,
  getPriorityInfo,
} from "@/lib/finance-helpers"
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
import { toast } from "sonner"

interface AddProjectDialogProps {
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
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<ProjectPriority>("medium")
  const [category, setCategory] = useState<ProjectCategory>("other")
  const [coverImage, setCoverImage] = useState("")
  const [status, setStatus] = useState<"not-started" | "in-progress" | "on-hold" | "completed">("not-started")
  const [notes, setNotes] = useState("")
  const addProject = useFinanceStore((s) => s.addProject)

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter a project name")
      return
    }
    addProject({
      name: name.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      category,
      coverImage: coverImage.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    })
    toast.success("Project created")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-name">Project Name *</Label>
        <Input
          id="project-name"
          placeholder="e.g., Home Office Setup"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <Textarea
          id="project-description"
          placeholder="What's this project about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="project-due-date">Due Date</Label>
          <Input
            id="project-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-priority">Priority</Label>
          <select
            id="project-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProjectPriority)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {PROJECT_PRIORITIES.map((p) => {
              const info = getPriorityInfo(p)
              return (
                <option key={p} value={p}>
                  {info.label}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-category">Category</Label>
        <select
          id="project-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProjectCategory)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {PROJECT_CATEGORIES.map((cat) => {
            const info = getCategoryInfo_project(cat)
            return (
              <option key={cat} value={cat}>
                {info.label}
              </option>
            )
          })}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-cover-image">Cover Image URL</Label>
        <Input
          id="project-cover-image"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="project-status">Status</Label>
          <select
            id="project-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "not-started" | "in-progress" | "on-hold" | "completed")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-notes">Notes</Label>
        <Textarea
          id="project-notes"
          placeholder="Any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Create Project
        </Button>
      </div>
    </div>
  )
}

export function AddProjectDialog({ open, onOpenChange }: AddProjectDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>New Project</DrawerTitle>
            <DrawerDescription>Create a new project or goal</DrawerDescription>
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
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Create a new project or goal</DialogDescription>
        </DialogHeader>
        <FormContent onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
