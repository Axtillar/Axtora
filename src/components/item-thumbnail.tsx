"use client"

import { useState } from "react"
import { Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ItemThumbnailProps {
  imageUrl?: string
  name: string
  className?: string
  iconClassName?: string
  fallbackIcon?: React.ElementType
  onClick?: () => void
}

export function ItemThumbnail({
  imageUrl,
  name,
  className,
  iconClassName,
  fallbackIcon: FallbackIcon = ImageIcon,
  onClick,
}: ItemThumbnailProps) {
  const [error, setError] = useState(false)

  // No image URL or failed to load — show fallback icon
  if (!imageUrl || error) {
    return (
      <div
        className={cn(
          "shrink-0 rounded-md bg-muted flex items-center justify-center",
          className
        )}
      >
        <FallbackIcon className={cn("text-muted-foreground/40", iconClassName)} />
      </div>
    )
  }

  // Image URL exists and hasn't errored — show image
  if (onClick) {
    return (
      <button
        className={cn(
          "shrink-0 rounded-md overflow-hidden bg-muted",
          className
        )}
        onClick={onClick}
      >
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      </button>
    )
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-md overflow-hidden bg-muted",
        className
      )}
    >
      <img
        src={imageUrl}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}
