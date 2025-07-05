"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface RetryButtonProps {
  onRetry: () => void
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

export function RetryButton({ onRetry, loading = false, className = "", children }: RetryButtonProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <p className="text-muted-foreground mb-4">
        {children || "No se pudieron cargar los datos"}
      </p>
      <Button 
        onClick={onRetry} 
        disabled={loading}
        variant="outline"
        className="gap-2"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Reintentar
      </Button>
    </div>
  )
} 