"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Send } from "lucide-react"
import { RetryButton } from "@/components/ui/retry-button"
import api from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Category {
  _id: string
  name: string
  description: string
}

export default function NewTopicPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: ""
  })

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await api.get('/forums/categories')
      setCategories(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar categorías')
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      setError("Por favor completa todos los campos")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/forums/topics', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId
      })

      // Redirigir al tema creado
      router.push(`/forums/topic/${response.data._id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear el tema')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // Limpiar error al escribir
  }

  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/forums">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Foros
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Tema</h1>
          <p className="text-muted-foreground">Comparte tus pensamientos con la comunidad</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Escribe un título descriptivo para tu tema..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={200}
              />
              <p className="text-sm text-muted-foreground">
                {formData.title.length}/200 caracteres
              </p>
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <Label htmlFor="content">Contenido *</Label>
              <Textarea
                id="content"
                placeholder="Escribe el contenido de tu tema aquí..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={10}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {formData.content.length} caracteres
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.content.trim() || !formData.categoryId}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Crear Tema
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/forums">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 