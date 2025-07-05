"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Menu, X, Home, Film, Calendar, Compass, MessageSquare, User, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { SITE_NAME } from "../lib/siteConfig"
import api from "@/lib/api"
import AnimeSearchAutocomplete from "@/components/AnimeSearchAutocomplete"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const isMobile = useMobile()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionError, setSuggestionError] = useState("")
  let debounceTimeout: NodeJS.Timeout

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    window.location.href = `/explorar?q=${encodeURIComponent(searchQuery)}`
  }

  // Autocompletado: buscar sugerencias mientras el usuario escribe
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([])
      setShowSuggestions(false)
      setSuggestionError("")
      return
    }
    setLoadingSuggestions(true)
    setSuggestionError("")
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(async () => {
      try {
        const res = await api.get(`/anime/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
        const data = res.data?.data || []
        setSuggestions(data.slice(0, 5))
        setShowSuggestions(true)
      } catch (err: any) {
        setSuggestionError("Error buscando sugerencias")
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300) // 300ms debounce
    return () => clearTimeout(debounceTimeout)
  }, [searchQuery])

  // Cerrar sugerencias al perder foco
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150)
  }

  const navItems = [
    { name: "Inicio", href: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Explorar", href: "/explorar", icon: <Film className="h-4 w-4 mr-2" /> },
    { name: "Temporadas", href: "/explorar/seasons", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: "Foros", href: "/forums", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { name: "Perfil", href: "/profile", icon: <User className="h-4 w-4 mr-2" /> },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {SITE_NAME}
              </span>
            </Link>
          </div>

          {!isMobile && (
            <nav className="mx-6 hidden md:flex items-center space-x-4 flex-1 justify-center">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 transition-colors"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden md:flex relative items-center">
              <AnimeSearchAutocomplete
                size="small"
                placeholder="Buscar anime..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="mr-2"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-full">
                <Search className="h-4 w-4" />
              </Button>
            </form>

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

            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && isMobile && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <form onSubmit={handleSearch} className="p-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Buscar anime..."
                  className="w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

