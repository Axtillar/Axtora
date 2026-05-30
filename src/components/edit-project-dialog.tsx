"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore, type ProjectPriority, type ProjectCategory } from "@/store/finance-store"
import { PROJECT_CATEGORIES, PROJECT_PRIORITIES, getCategoryInfo_project, getPriorityInfo } from "@/lib/finance-helpers"
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
import { toast } from "sonner"

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

function FormContent({
  projectId,
  onSubmit,
  onCancel,
}: {
  projectId: string
  onSubmit: () => void
  onCancel: () => void
}) {
  const project = useFinanceStore((s) => s.projects.find((p) => p.id === projectId))
  const updateProject = useFinanceStore((s) => s.updateProject)

  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [dueDate, setDueDate] = useState(project?.dueDate || "")
  const [priority, setPriority] = useState<ProjectPriority>(project?.priority || "medium")
  const [category, setCategory] = useState<ProjectCategory>(project?.category || "other")
  const [coverImage, setCoverImage] = useState(project?.coverImage || "")
  const [status, setStatus] = useState<"not-started" | "in-progress" | "on-hold" | "completed">(project?.status || "not-started")
  const [notes, setNotes] = useState(project?.notes || "")

  if (!project) return null

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter a project name")
      return
    }
    updateProject(projectId, {
      name: name.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      category,
      coverImage: coverImage.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    })
    toast.success("Project updated")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-proj-name">Project Name *</Label>
        <Input id="edit-proj-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-proj-desc">Description</Label>
        <Textarea id="edit-proj-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-proj-due">Due Date</Label>
          <Input id="edit-proj-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-proj-priority">Priority</Label>
          <select id="edit-proj-priority" value={priority} onChange={(e) => setPriority(e.target.value as ProjectPriority)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
            {PROJECT_PRIORITIES.map((p) => (
              <option key={p} value={p}>{getPriorityInfo(p).label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-proj-cat">Category</Label>
        <select id="edit-proj-cat" value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
          {PROJECT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{getCategoryInfo_project(cat).label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-proj-cover">Cover Image URL</Label>
        <Input id="edit-proj-cover" type="url" placeholder="https://..." value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-proj-status">Status</Label>
          <select id="edit-proj-status" value={status} onChange={(e) => setStatus(e.target.value as "not-started" | "in-progress" | "on-hold" | "completed")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-proj-notes">Notes</Label>
        <Textarea id="edit-proj-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any additional notes..." />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}

export function EditProjectDialog({ open, onOpenChange, projectId }: EditProjectDialogProps) {
  const isMobile = useIsMobile()
  const content = <FormContent projectId={projectId} onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Edit Project</DrawerTitle><DrawerDescription>Update this project</DrawerDescription></DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Project</DialogTitle><DialogDescription>Update this project</DialogDescription></DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
