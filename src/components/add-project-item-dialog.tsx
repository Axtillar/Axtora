"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore } from "@/store/finance-store"
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

interface AddProjectItemDialogProps {
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
  const [name, setName] = useState("")
  const [cost, setCost] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [quantity, setQuantity] = useState("1")
  const addProjectItem = useFinanceStore((s) => s.addProjectItem)

  const handleSubmit = () => {
    if (!name.trim() || !cost || parseFloat(cost) < 0) {
      toast.error("Please fill in all required fields")
      return
    }
    addProjectItem(projectId, {
      name: name.trim(),
      cost: parseFloat(cost),
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      quantity: parseInt(quantity) > 0 ? parseInt(quantity) : 1,
    })
    toast.success("Item added to project")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="item-name">Item Name *</Label>
        <Input
          id="item-name"
          placeholder="e.g., Ergonomic Chair"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-cost">Cost ($) *</Label>
        <Input
          id="item-cost"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-image">Image URL</Label>
        <Input
          id="item-image"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="item-quantity">Quantity</Label>
          <Input
            id="item-quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-notes">Notes</Label>
        <Textarea
          id="item-notes"
          placeholder="Any notes about this item..."
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
          Add Item
        </Button>
      </div>
    </div>
  )
}

export function AddProjectItemDialog({
  open,
  onOpenChange,
  projectId,
}: AddProjectItemDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Item</DrawerTitle>
            <DrawerDescription>Add a new item to this project</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">
            <FormContent
              projectId={projectId}
              onSubmit={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>Add a new item to this project</DialogDescription>
        </DialogHeader>
        <FormContent
          projectId={projectId}
          onSubmit={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
