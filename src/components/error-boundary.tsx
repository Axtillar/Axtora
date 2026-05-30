"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Axtora] ErrorBoundary caught:", error, errorInfo)
  }

  handleClearDataAndReload = () => {
    try {
      // Clear all localStorage keys used by Axtora
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith("finance-store") || key.startsWith("axtora"))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch {
      // Ignore errors during cleanup
    }
    try {
      // Also clear IndexedDB if any exists
      if (typeof indexedDB !== "undefined") {
        indexedDB.deleteDatabase("axtora-secure-db")
      }
    } catch {
      // Ignore
    }
    window.location.reload()
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Try refreshing first. If the problem persists, clear app data to reset.
            </p>
            {this.state.error && (
              <details className="text-left bg-muted/50 rounded-lg p-3">
                <summary className="text-xs font-bold cursor-pointer text-muted-foreground">
                  Error details
                </summary>
                <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                  {this.state.error.message}
                </p>
              </details>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center rounded-md bg-[#14B8A6] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#14B8A6]/90 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleClearDataAndReload}
                className="inline-flex items-center justify-center rounded-md border border-red-300 dark:border-red-800 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Clear Data & Reset
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
