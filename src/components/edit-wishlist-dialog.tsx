"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFinanceStore, type WishlistItem } from "@/store/finance-store"
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

interface EditWishlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
}

function FormContent({
  itemId,
  onSubmit,
  onCancel,
}: {
  itemId: string
  onSubmit: () => void
  onCancel: () => void
}) {
  const item = useFinanceStore((s) => s.wishlistItems.find((w) => w.id === itemId))
  const updateWishlistItem = useFinanceStore((s) => s.updateWishlistItem)

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [category, setCategory] = useState<string>("")
  const [priority, setPriority] = useState<string>("")
  const [purchasedDate, setPurchasedDate] = useState("")

  useEffect(() => {
    if (item) {
      setName(item.name)
      setPrice(item.price.toString())
      setLink(item.link || "")
      setImageUrl(item.imageUrl || "")
      setNotes(item.notes || "")
      setCategory(item.category || "")
      setPriority(item.priority || "")
      setPurchasedDate(item.purchasedDate || "")
    }
  // Only re-initialize form when itemId changes (dialog opens for different item)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId])

  if (!item) return null

  const handleSubmit = () => {
    if (!name.trim() || !price || parseFloat(price) <= 0) {
      toast.error("Please fill in all required fields")
      return
    }
    updateWishlistItem(itemId, {
      name: name.trim(),
      price: parseFloat(price),
      link: link.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      category: (category || undefined) as WishlistItem["category"],
      priority: (priority || undefined) as WishlistItem["priority"],
      purchasedDate: item.purchased ? (purchasedDate || undefined) : undefined,
    })
    toast.success("Wishlist item updated")
    onSubmit()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-wl-name">Name *</Label>
        <Input id="edit-wl-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-wl-price">Price ($) *</Label>
        <Input id="edit-wl-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-wl-link">Link (optional)</Label>
        <Input id="edit-wl-link" type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-wl-image">Image URL (optional)</Label>
        <Input id="edit-wl-image" type="url" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-wl-notes">Notes (optional)</Label>
        <Textarea
          id="edit-wl-notes"
          placeholder="Add any notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[60px] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-wl-category">Category</Label>
          <select
            id="edit-wl-category"
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
          <Label htmlFor="edit-wl-priority">Priority</Label>
          <select
            id="edit-wl-priority"
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

      {item.purchased && (
        <div className="space-y-2">
          <Label htmlFor="edit-wl-purchased-date">Purchased Date</Label>
          <Input
            id="edit-wl-purchased-date"
            type="date"
            value={purchasedDate}
            onChange={(e) => setPurchasedDate(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}

export function EditWishlistDialog({ open, onOpenChange, itemId }: EditWishlistDialogProps) {
  const isMobile = useIsMobile()
  const content = <FormContent itemId={itemId} onSubmit={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Edit Wishlist Item</DrawerTitle><DrawerDescription>Update this item</DrawerDescription></DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Wishlist Item</DialogTitle><DialogDescription>Update this item</DialogDescription></DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
