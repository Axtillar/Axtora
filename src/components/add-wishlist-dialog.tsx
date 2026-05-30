"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore, type WishlistItem } from "@/store/finance-store"
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

interface AddWishlistDialogProps {
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
  const [price, setPrice] = useState("")
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [category, setCategory] = useState<string>("")
  const [priority, setPriority] = useState<string>("")
  const addWishlistItem = useFinanceStore((s) => s.addWishlistItem)

  const handleSubmit = () => {
    if (!name.trim() || !price || parseFloat(price) <= 0) {
      toast.error("Please fill in all required fields")
      return
    }
    addWishlistItem({
      name: name.trim(),
      price: parseFloat(price),
      link: link.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      category: (category || undefined) as WishlistItem["category"],
      priority: (priority || undefined) as WishlistItem["priority"],
    })
    toast.success("Added to wishlist")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wishlist-name">Name *</Label>
        <Input
          id="wishlist-name"
          placeholder="e.g., New Headphones"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wishlist-price">Price ($) *</Label>
        <Input
          id="wishlist-price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wishlist-link">Link (optional)</Label>
        <Input
          id="wishlist-link"
          type="url"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wishlist-image">Image URL (optional)</Label>
        <Input
          id="wishlist-image"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wishlist-notes">Notes (optional)</Label>
        <Textarea
          id="wishlist-notes"
          placeholder="Add any notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[60px] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="wishlist-category">Category</Label>
          <select
            id="wishlist-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">None</option>
            <option value="tech">Tech</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home</option>
            <option value="travel">Travel</option>
            <option value="entertainment">Entertainment</option>
            <option value="fitness">Fitness</option>
            <option value="books">Books</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wishlist-priority">Priority</Label>
          <select
            id="wishlist-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Add to Wishlist
        </Button>
      </div>
    </div>
  )
}

export function AddWishlistDialog({ open, onOpenChange }: AddWishlistDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add to Wishlist</DrawerTitle>
            <DrawerDescription>Add something you want</DrawerDescription>
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
          <DialogTitle>Add to Wishlist</DialogTitle>
          <DialogDescription>Add something you want</DialogDescription>
        </DialogHeader>
        <FormContent onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
