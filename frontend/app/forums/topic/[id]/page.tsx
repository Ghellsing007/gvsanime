"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, ArrowLeft, MessageSquare, Heart, Edit, Trash2, Send, Users, Eye } from "lucide-react"
import { RetryButton } from "@/components/ui/retry-button"
import api from "@/lib/api"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

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

interface Post {
  _id: string
  content: string
  topicId: string
  userId: string
  username: string
  createdAt: string
  updatedAt: string
  likes?: number
  isLiked?: boolean
}

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.id as string
  
  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPost, setNewPost] = useState("")
  const [posting, setPosting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const fetchTopic = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/forums/topics/${topicId}`)
      setTopic(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el tema')
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/forums/posts?topicId=${topicId}`)
      setPosts(response.data)
    } catch (err: any) {
      console.error('Error al cargar posts:', err)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setCurrentUser(response.data)
    } catch (err) {
      // Usuario no autenticado
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    if (topicId) {
      fetchTopic()
      fetchPosts()
      fetchCurrentUser()
    }
  }, [topicId])

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPost.trim()) return

    try {
      setPosting(true)
      const response = await api.post('/forums/posts', {
        content: newPost.trim(),
        topicId: topicId
      })
      
      setPosts(prev => [...prev, response.data])
      setNewPost("")
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al publicar el comentario')
    } finally {
      setPosting(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      await api.put(`/forums/posts/${postId}/like`)
      // Actualizar el estado local
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, likes: (post.likes || 0) + 1, isLiked: true }
          : post
      ))
    } catch (err: any) {
      console.error('Error al dar like:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (username: string) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <RetryButton onRetry={fetchTopic} loading={loading}>
          {error || 'Tema no encontrado'}
        </RetryButton>
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{topic.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{topic.username}</span>
            </div>
            <span>{formatDate(topic.createdAt)}</span>
            {topic.categoryName && (
              <Badge variant="secondary">{topic.categoryName}</Badge>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{posts.length} respuestas</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{topic.viewCount || 0} vistas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tema principal */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(topic.username)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{topic.username}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(topic.createdAt)}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{topic.content}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Respuestas ({posts.length})</h2>
        
        {posts.map((post) => (
          <Card key={post._id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(post.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.username}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post._id)}
                        className="gap-1"
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{post.likes || 0}</span>
                      </Button>
                      {currentUser && (currentUser.id === post.userId || currentUser.role === 'admin') && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No hay respuestas aún. ¡Sé el primero en comentar!
            </CardContent>
          </Card>
        )}
      </div>

      {/* Formulario para nueva respuesta */}
      {currentUser && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Responder</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <Textarea
                placeholder="Escribe tu respuesta..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={posting || !newPost.trim()}
                  className="gap-2"
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Publicar Respuesta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!currentUser && (
        <Card className="mt-8">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Necesitas iniciar sesión para responder
            </p>
            <Button asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 