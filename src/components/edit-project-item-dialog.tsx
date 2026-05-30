"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore } from "@/store/finance-store"
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

interface EditProjectItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  itemId: string
}

function FormContent({
  projectId,
  itemId,
  onSubmit,
  onCancel,
}: {
  projectId: string
  itemId: string
  onSubmit: () => void
  onCancel: () => void
}) {
  const project = useFinanceStore((s) => s.projects.find((p) => p.id === projectId))
  const updateProjectItem = useFinanceStore((s) => s.updateProjectItem)
  const item = project?.items.find((i) => i.id === itemId)

  const [name, setName] = useState(item?.name || "")
  const [cost, setCost] = useState(item?.cost.toString() || "")
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || "")
  const [notes, setNotes] = useState(item?.notes || "")
  const [quantity, setQuantity] = useState((item?.quantity || 1).toString())

  if (!item) return null

  const handleSubmit = () => {
    if (!name.trim() || !cost || parseFloat(cost) < 0) {
      toast.error("Please fill in all required fields")
      return
    }
    updateProjectItem(projectId, itemId, {
      name: name.trim(),
      cost: parseFloat(cost),
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      quantity: parseInt(quantity) > 0 ? parseInt(quantity) : 1,
    })
    toast.success("Item updated")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-item-name">Item Name *</Label>
        <Input id="edit-item-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-item-cost">Cost ($) *</Label>
        <Input id="edit-item-cost" type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-item-image">Image URL</Label>
        <Input id="edit-item-image" type="url" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-item-quantity">Quantity</Label>
          <Input id="edit-item-quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-item-notes">Notes</Label>
        <Textarea id="edit-item-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any notes about this item..." />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}

export function EditProjectItemDialog({ open, onOpenChange, projectId, itemId }: EditProjectItemDialogProps) {
  const isMobile = useIsMobile()
  const content = <FormContent projectId={projectId} itemId={itemId} onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Edit Item</DrawerTitle><DrawerDescription>Update this item</DrawerDescription></DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Item</DialogTitle><DialogDescription>Update this item</DialogDescription></DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
