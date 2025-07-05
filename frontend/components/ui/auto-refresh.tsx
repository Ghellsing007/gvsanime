"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Clock, Pause, Play } from "lucide-react"

interface AutoRefreshProps {
  onRefresh: () => Promise<void>
  interval?: number // en milisegundos
  enabled?: boolean
  onToggle?: (enabled: boolean) => void
  children?: React.ReactNode
}

export function AutoRefresh({ 
  onRefresh, 
  interval = 30000, // 30 segundos por defecto
  enabled: initialEnabled = false,
  onToggle,
  children 
}: AutoRefreshProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [timeLeft, setTimeLeft] = useState(interval)

  const handleToggle = useCallback((checked: boolean) => {
    setEnabled(checked)
    setTimeLeft(interval)
    onToggle?.(checked)
  }, [interval, onToggle])

  const handleManualRefresh = useCallback(async () => {
    setTimeLeft(interval)
    await onRefresh()
  }, [onRefresh, interval])

  useEffect(() => {
    if (!enabled) {
      setTimeLeft(interval)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          onRefresh()
          return interval
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [enabled, interval, onRefresh])

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Auto-refresh</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
        />
        {enabled && (
          <span className="text-sm text-muted-foreground">
            {formatTime(timeLeft)}
          </span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleManualRefresh}
        className="gap-2"
      >
        {enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        Recargar ahora
      </Button>

      {children}
    </div>
  )
} 