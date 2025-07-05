"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, MessageSquare, Plus, Search, Users, Eye } from "lucide-react"
import { RetryButton } from "@/components/ui/retry-button"
import { ForumBreadcrumb } from "@/components/ui/forum-breadcrumb"
import api from "@/lib/api"
import Link from "next/link"

interface Category {
  _id: string
  name: string
  description: string
  createdAt: string
}

interface Topic {
  _id: string
  title: string
  content: string
  categoryId: string
  categoryName?: string
  userId: string
  username: string
  createdAt: string
  updatedAt: string
  postCount?: number
  viewCount?: number
}

export default function ForumsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/forums/categories')
      setCategories(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const fetchTopics = async (categoryId?: string) => {
    try {
      setLoading(true)
      setError(null)
      const params = categoryId && categoryId !== 'all' ? `?categoryId=${categoryId}` : ''
      const response = await api.get(`/forums/topics${params}`)
      setTopics(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar temas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchTopics()
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'all') {
      fetchTopics()
    } else {
      fetchTopics(value)
    }
  }

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error && categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <RetryButton onRetry={fetchCategories} loading={loading}>
          {error}
        </RetryButton>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <ForumBreadcrumb items={[{ label: "Foros" }]} />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Foros</h1>
          <p className="text-muted-foreground">Discute sobre anime con la comunidad</p>
        </div>
        <Button asChild>
          <Link href="/forums/new-topic">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tema
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Categorías */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={activeTab === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleTabChange("all")}
                >
                  Todos los temas
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category._id}
                    variant={activeTab === category._id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange(category._id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Temas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" ? "Todos los temas" : 
                 categories.find(c => c._id === activeTab)?.name || "Temas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <RetryButton onRetry={() => fetchTopics(activeTab === "all" ? undefined : activeTab)} loading={loading}>
                  {error}
                </RetryButton>
              ) : filteredTopics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No se encontraron temas que coincidan con tu búsqueda" : "No hay temas en esta categoría"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTopics.map((topic) => (
                    <div
                      key={topic._id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/forums/topic/${topic._id}`} className="flex-1">
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                            {topic.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span>{topic.postCount || 0}</span>
                          <Eye className="h-4 w-4" />
                          <span>{topic.viewCount || 0}</span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {topic.content}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{topic.username}</span>
                          </div>
                          <span>{formatDate(topic.createdAt)}</span>
                          {topic.categoryName && (
                            <Badge variant="secondary">{topic.categoryName}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 