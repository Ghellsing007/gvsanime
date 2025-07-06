"use client"

import { useAuth } from "@/hooks/useAuth"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { User, MessageSquare, Heart, Settings, LogOut, Edit, Shield } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import CDNStatus from "@/components/cdn-status"

function isAdminOrMod(user: { role?: string }): boolean {
  return user?.role === "admin" || user?.role === "moderator";
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "info"
  const [tab, setTab] = useState(tabParam)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [errorUsers, setErrorUsers] = useState("")
  const [animeCount, setAnimeCount] = useState<number | null>(null)
  const [forumCount, setForumCount] = useState<number | null>(null)
  const [topicCount, setTopicCount] = useState<number | null>(null)

  useEffect(() => {
    setTab(tabParam)
  }, [tabParam])

  useEffect(() => {
    if (isAdminOrMod(user ?? {})) {
      setLoadingUsers(true)
      fetch("/api/admin/users")
        .then(res => res.json())
        .then(data => {
          setUsers(data.users || [])
          setErrorUsers("")
        })
        .catch(() => setErrorUsers("No se pudieron cargar los usuarios"))
        .finally(() => setLoadingUsers(false))

      // Obtener total de animes
      fetch("/api/anime")
        .then(res => res.json())
        .then(data => {
          setAnimeCount(Array.isArray(data) ? data.length : (data.data?.length || data.data?.total || 0))
        })
        .catch(() => setAnimeCount(null))

      // Obtener total de foros
      fetch("/api/forums")
        .then(res => res.json())
        .then(data => {
          setForumCount(Array.isArray(data) ? data.length : (data.forums?.length || 0))
        })
        .catch(() => setForumCount(null))

      // Obtener total de temas
      fetch("/api/forums/topics")
        .then(res => res.json())
        .then(data => {
          setTopicCount(Array.isArray(data) ? data.length : (data.topics?.length || 0))
        })
        .catch(() => setTopicCount(null))
    }
  }, [user])

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
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
          <TabsTrigger value="config"><Settings className="mr-2 h-4 w-4" /> Configuración</TabsTrigger>
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
        <TabsContent value="config">
          <div className="bg-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Configuración</h3>
            <p className="text-muted-foreground">Aquí podrás personalizar tus preferencias de usuario.</p>
          </div>
        </TabsContent>
        {isAdminOrMod(user ?? {}) && (
          <TabsContent value="admin">
            <div className="bg-muted rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Panel de Administración</h3>
              {/* Tarjetas de resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-background rounded-lg shadow p-4 flex flex-col items-center">
                  <span className="text-2xl font-bold">{loadingUsers ? '--' : users.length}</span>
                  <span className="text-muted-foreground">Usuarios</span>
                </div>
                <div className="bg-background rounded-lg shadow p-4 flex flex-col items-center">
                  <span className="text-2xl font-bold">{animeCount === null ? '--' : animeCount}</span>
                  <span className="text-muted-foreground">Animes</span>
                </div>
                <div className="bg-background rounded-lg shadow p-4 flex flex-col items-center">
                  <span className="text-2xl font-bold">{forumCount === null ? '--' : forumCount}</span>
                  <span className="text-muted-foreground">Foros</span>
                </div>
                <div className="bg-background rounded-lg shadow p-4 flex flex-col items-center">
                  <span className="text-2xl font-bold">{topicCount === null ? '--' : topicCount}</span>
                  <span className="text-muted-foreground">Temas</span>
                </div>
              </div>
              
              {/* Estado del CDN */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Estado del Sistema CDN
                </h4>
                <CDNStatus />
              </div>
              {/* Placeholders de gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-background rounded-lg shadow p-4 h-64 flex items-center justify-center">
                  <span className="text-muted-foreground">[Gráfico de usuarios por rol]</span>
                </div>
                <div className="bg-background rounded-lg shadow p-4 h-64 flex items-center justify-center">
                  <span className="text-muted-foreground">[Gráfico de animes por género]</span>
                </div>
              </div>
              {/* Tabla de usuarios */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-2">Gestión de Usuarios</h4>
                <div className="bg-background rounded-lg shadow p-4 overflow-x-auto">
                  {loadingUsers ? (
                    <p className="text-muted-foreground">Cargando usuarios...</p>
                  ) : errorUsers ? (
                    <p className="text-red-600">{errorUsers}</p>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left">Nombre</th>
                          <th className="px-2 py-1 text-left">Email</th>
                          <th className="px-2 py-1 text-left">Rol</th>
                          <th className="px-2 py-1 text-left">Creado</th>
                          <th className="px-2 py-1 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b hover:bg-muted/50">
                            <td className="px-2 py-1">{u.username}</td>
                            <td className="px-2 py-1">{u.email}</td>
                            <td className="px-2 py-1 capitalize">{u.role}</td>
                            <td className="px-2 py-1">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                            <td className="px-2 py-1">
                              {/* Aquí irán los botones de acción (editar, eliminar, cambiar rol, bloquear) */}
                              <span className="text-muted-foreground">Próximamente</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-2">Gestión de Animes</h4>
                <div className="bg-background rounded-lg shadow p-4">
                  <span className="text-muted-foreground">[Tabla de animes con acciones de ver, eliminar, (editar)]</span>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-2">Gestión de Foros y Temas</h4>
                <div className="bg-background rounded-lg shadow p-4">
                  <span className="text-muted-foreground">[Tabla de foros, temas y posts con acciones de moderación]</span>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Gestión de Categorías</h4>
                <div className="bg-background rounded-lg shadow p-4">
                  <span className="text-muted-foreground">[Tabla de categorías de foros y géneros de anime]</span>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Botón cerrar sesión */}
      <div className="flex justify-end mt-8">
        <Button variant="ghost" className="text-red-600 gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>
    </div>
  )
} 