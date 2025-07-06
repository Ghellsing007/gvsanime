"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Menu, X, Home, Film, Calendar, MessageSquare, User, Sun, Moon, LogIn, UserPlus, LogOut } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/AuthContext"
import AnimeSearchAutocomplete from "@/components/AnimeSearchAutocomplete"
import { UserMenu } from "@/components/ui/user-menu"
import { SITE_NAME } from "@/lib/siteConfig"
import api from "@/lib/api"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const isMobile = useMobile()
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `/explorar?q=${encodeURIComponent(searchQuery)}`
  }

  const navItems = [
    { name: "Inicio", href: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Explorar", href: "/explorar", icon: <Film className="h-4 w-4 mr-2" /> },
    { name: "Temporadas", href: "/explorar/seasons", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: "Foros", href: "/forums", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    
  ]

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-200",
      isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background"
    )}>
      <div className="w-full px-4 md:px-6 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between h-16 gap-2 flex-wrap">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent truncate max-w-[160px] sm:max-w-[200px]">
            {SITE_NAME}
          </Link>

          {/* Navegación (Desktop) */}
          {!isMobile && (
            <nav className="flex-1 hidden md:flex justify-center gap-2 min-w-0">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 transition-colors whitespace-nowrap truncate"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Búsqueda + Acciones */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            {/* Búsqueda */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center min-w-0 max-w-[300px] w-full">
              <AnimeSearchAutocomplete
                size="small"
                placeholder="Buscar anime..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="min-w-0 w-[120px] sm:w-[180px] md:w-[220px] lg:w-[280px] truncate"
              />
              <Button type="submit" size="icon" variant="ghost" className="ml-1">
                <Search className="h-5 w-5" />
              </Button>
            </form>

            {/* Tema */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {mounted && theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="sr-only">Cambiar tema</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="h-4 w-4 mr-2" />
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4 mr-2" />
                  Oscuro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Autenticación */}
            {!authLoading && (
              isAuthenticated && user ? (
                <UserMenu user={user} onLogout={logout} />
              ) : (
                <div className="hidden md:flex gap-2 items-center">
                  <Button variant="ghost" size="sm" asChild className="whitespace-nowrap">
                    <Link href="/auth/login">
                      <LogIn className="h-4 w-4 mr-1" />
                      Iniciar Sesión
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="whitespace-nowrap">
                    <Link href="/auth/register">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Registrarse
                    </Link>
                  </Button>
                </div>
              )
            )}

            {/* Menú móvil */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobile && isOpen && (
        <div className="md:hidden animate-fade-in bg-background shadow-inner">
          <div className="p-4 space-y-3">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Buscar anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-muted text-sm"
                />
                <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {/* Cambio de tema en móvil */}
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-sm">Tema:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="flex items-center gap-2"
              >
                {mounted && theme === "light" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span className="text-sm">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span className="text-sm">Oscuro</span>
                  </>
                )}
              </Button>
            </div>

            {!authLoading && !isAuthenticated && (
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrarse
                  </Link>
                </Button>
              </div>
            )}

                         {isAuthenticated && user && (
               <div className="p-2">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                     {user.username.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <p className="text-sm font-medium">{user.username}</p>
                     <p className="text-xs text-muted-foreground">{user.email}</p>
                   </div>
                 </div>
                 <Button 
                   variant="ghost" 
                   className="w-full justify-start text-red-600 hover:text-red-600"
                   onClick={() => {
                     logout()
                     setIsOpen(false)
                   }}
                 >
                   <LogOut className="h-4 w-4 mr-2" />
                   Cerrar Sesión
                 </Button>
               </div>
             )}
          </div>
        </div>
      )}
    </header>
  )
}
