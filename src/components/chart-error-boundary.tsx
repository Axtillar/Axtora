"use client"

import React from "react"

interface ChartErrorBoundaryProps {
  children: React.ReactNode
}

interface ChartErrorBoundaryState {
  hasError: boolean
}

/**
 * Lightweight error boundary specifically for chart components.
 * If Recharts crashes, we show a fallback instead of crashing the entire app.
 */
export class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Axtora] Chart error caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-48 lg:h-56 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-sm font-bold">Chart unavailable</p>
            <p className="text-xs mt-1">Refresh the page to try again</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
