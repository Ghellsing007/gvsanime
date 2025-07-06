"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { User, MessageSquare, Heart, Settings, LogOut, Edit, Shield } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"

function isAdminOrMod(user: { role?: string }): boolean {
  return user?.role === "admin" || user?.role === "moderator";
}

function ProfileContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "info"
  const [tab, setTab] = useState(tabParam)

  useEffect(() => {
    setTab(tabParam)
  }, [tabParam])

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header de perfil */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="outline" className="ml-auto gap-2">
          <Edit className="h-4 w-4" /> Editar perfil
        </Button>
      </div>

      {/* Tabs de navegación */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="info"><User className="mr-2 h-4 w-4" /> Información</TabsTrigger>
          <TabsTrigger value="foros"><MessageSquare className="mr-2 h-4 w-4" /> Mis Foros</TabsTrigger>
          <TabsTrigger value="favoritos"><Heart className="mr-2 h-4 w-4" /> Favoritos</TabsTrigger>
          {/* <TabsTrigger value="config"><Settings className="mr-2 h-4 w-4" /> Configuración</TabsTrigger> */}
          {isAdminOrMod(user ?? {}) && (
            <TabsTrigger value="admin"><Shield className="mr-2 h-4 w-4" /> Administrar</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="info">
          <div className="bg-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Información personal</h3>
            <p className="text-muted-foreground mb-2">Nombre de usuario: <span className="font-medium">{user?.username}</span></p>
            <p className="text-muted-foreground mb-2">Email: <span className="font-medium">{user?.email}</span></p>
            <Button variant="secondary" className="mt-4"><Edit className="h-4 w-4 mr-2" />Editar información</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="foros">
          <div className="bg-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Mis Foros</h3>
            <p className="text-muted-foreground">Aquí aparecerán los temas y respuestas que has creado en los foros.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="favoritos">
          <div className="bg-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Favoritos</h3>
            <p className="text-muted-foreground">Aquí aparecerán tus animes o posts favoritos.</p>
          </div>
        </TabsContent>
        
        {/* <TabsContent value="config">
          <div className="bg-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Configuración</h3>
            <p className="text-muted-foreground">Aquí podrás personalizar tus preferencias de usuario.</p>
          </div>
        </TabsContent> */}
        
        {isAdminOrMod(user ?? {}) && (
          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
        )}
      </Tabs>

      {/* Botón cerrar sesión */}
      <div className="flex justify-end mt-8">
        <Button 
          variant="ghost" 
          className="text-red-600 gap-2" 
          onClick={() => {
            logout()
            router.push('/')
          }}
        >
          <LogOut className="h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto py-10 px-4">Cargando perfil...</div>}>
      <ProfileContent />
    </Suspense>
  )
} 