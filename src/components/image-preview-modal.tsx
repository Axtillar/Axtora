"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, X, ImageIcon } from "lucide-react"

interface ImagePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  title?: string
}

export function ImagePreviewModal({
  open,
  onOpenChange,
  imageUrl,
  title,
}: ImagePreviewModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val)
    if (!val) {
      setLoading(true)
      setError(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{title || "Image Preview"}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          {loading && !error && (
            <Skeleton className="w-full aspect-video" />
          )}
          {error ? (
            <div className="w-full aspect-video flex flex-col items-center justify-center bg-muted/50 gap-3">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Image not available
              </p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={title || "Preview"}
              className={`w-full h-auto max-h-[70vh] object-contain bg-black/5 ${
                loading ? "hidden" : "block"
              }`}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false)
                setError(true)
              }}
            />
          )}
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground truncate max-w-[60%]">
            {title || "Image Preview"}
          </p>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Open in new tab
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
