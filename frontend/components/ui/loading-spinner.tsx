import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div className="relative">
        <Loader2 className={cn("text-primary animate-spin", sizeClasses[size])} />
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-primary/20 animate-ping",
          size === "sm" ? "border" : size === "md" ? "border-2" : "border-4"
        )}></div>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground text-center">{text}</p>
      )}
    </div>
  )
}

export function LoadingPage({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo animado con gradientes del tema */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 animate-pulse"></div>
      
      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  )
}

export function LoadingCard({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
} 