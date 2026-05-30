"use client"

import { cn } from "@/lib/utils"

interface AxtoraLogoProps {
  size?: number
  className?: string
  showText?: boolean
  textClassName?: string
}

/**
 * Axtora Logo — Pure SVG icon + bold text, no image files needed.
 * Renders identically on phone and PC.
 */
export function AxtoraLogo({
  size = 36,
  className,
  showText = false,
  textClassName,
}: AxtoraLogoProps) {
  const iconSize = size
  // Scale stroke based on size
  const strokeW = iconSize < 28 ? 2 : iconSize < 40 ? 2.2 : 2.5

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* SVG Icon — 3 ascending bars with teal-to-indigo gradient */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 rounded-lg"
      >
        {/* Background circle */}
        <rect width="40" height="40" rx="10" className="fill-primary" />
        {/* Bar 1 (short) */}
        <rect x="9" y="22" width="5" height="10" rx="1.5" className="fill-primary-foreground" opacity="0.6" />
        {/* Bar 2 (medium) */}
        <rect x="17" y="16" width="5" height="16" rx="1.5" className="fill-primary-foreground" opacity="0.8" />
        {/* Bar 3 (tall) */}
        <rect x="25" y="10" width="5" height="22" rx="1.5" className="fill-primary-foreground" />
        {/* Growth arc */}
        <path
          d="M10 24 Q20 8 30 12"
          stroke="currentColor"
          strokeWidth={strokeW * 0.5}
          strokeLinecap="round"
          className="fill-none stroke-primary-foreground"
          opacity="0.4"
        />
        {/* Dot on top of bar 3 */}
        <circle cx="27.5" cy="8.5" r="1.5" className="fill-primary-foreground" opacity="0.9" />
      </svg>

      {showText && (
        <span
          className={cn(
            "font-[family-name:var(--font-poppins)] font-extrabold tracking-tight text-foreground",
            textClassName
          )}
        >
          Axtora
        </span>
      )}
    </div>
  )
}
