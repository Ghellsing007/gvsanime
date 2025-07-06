"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus, Eye, EyeOff, Sparkles, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SITE_NAME } from "@/lib/siteConfig"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Por favor completa todos los campos")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const result = await register(formData.username, formData.email, formData.password)
      
      if (result.success) {
        if (result.message) {
          setError(result.message) // Mostrar mensaje de verificación
        } else {
          router.push("/")
        }
      } else {
        setError(result.error || "Error en el registro")
      }
    } catch (err) {
      setError("Error inesperado. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("") // Limpiar error al escribir
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo animado con partículas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-secondary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Gradientes decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md relative z-10">
        {/* Header con logo y título */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl mb-3 sm:mb-4 shadow-lg">
            <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent mb-1 sm:mb-2">
            {SITE_NAME}
          </h1>
          
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-muted-foreground mb-4 sm:mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Tu universo de anime</span>
            <Sparkles className="h-4 w-4" />
          </div>

          <h2 className="text-lg sm:text-2xl font-semibold text-foreground mb-1 sm:mb-2">
            ¡Únete a la comunidad!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Crea tu cuenta y comienza a explorar
          </p>
        </div>

        {/* Formulario */}
        <Card className="w-full bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-center text-lg sm:text-xl">Crear Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="username" className="text-xs sm:text-sm font-medium">
                  Nombre de usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="tu_usuario"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="h-10 sm:h-11 bg-background/50 border-border/50 focus:border-secondary/50 text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-10 sm:h-11 bg-background/50 border-border/50 focus:border-secondary/50 text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-10 sm:h-11 bg-background/50 border-border/50 focus:border-secondary/50 pr-10 text-sm sm:text-base"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-10 sm:h-11 bg-background/50 border-border/50 focus:border-secondary/50 pr-10 text-sm sm:text-base"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Requisitos de contraseña */}
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos de contraseña:</p>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${
                    formData.password.length >= 6 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <CheckCircle className="h-3 w-3" />
                    Mínimo 6 caracteres
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    formData.password === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <CheckCircle className="h-3 w-3" />
                    Las contraseñas coinciden
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in slide-in-from-top-2">
                  <p className="text-destructive text-xs sm:text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 sm:h-11 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white font-medium gap-2 shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Crear Cuenta
              </Button>
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Link 
                    href="/auth/login" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/" 
                  className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Al registrarte, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  )
} 