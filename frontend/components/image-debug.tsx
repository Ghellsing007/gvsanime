"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import api from "../lib/api"
import { debugImageUrls, getHeroImage, getCardImage, getThumbnailImage } from "../lib/imageUtils"
import type { AnimeImages } from "../lib/types"

export default function ImageDebug() {
  const [anime, setAnime] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener un anime de ejemplo para debug
    const fetchAnime = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        console.log('🔍 Haciendo petición a:', `${backendUrl}/anime/search?q=naruto&limit=1`)
        
        const response = await fetch(`${backendUrl}/anime/search?q=naruto&limit=1`)
        const data = await response.json()
        
        console.log('📦 Respuesta completa del backend:', data)
        
        if (data.data && data.data.length > 0) {
          const animeData = data.data[0]
          console.log('🎬 Datos del anime:', animeData)
          console.log('🖼️ Estructura de imágenes:', animeData.images)
          setAnime(animeData)
        } else {
          console.log('❌ No se encontraron datos en la respuesta')
        }
      } catch (error) {
        console.error('💥 Error fetching anime:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnime()
  }, [])

  if (loading) return <div>Cargando...</div>
  if (!anime) return <div>No se pudo cargar el anime</div>

  const images = anime.images

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Debug de Imágenes: {anime.title}</h1>
      
      {/* Información de imágenes */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">URLs Disponibles:</h2>
        
        {images?.jpg && (
          <div className="mb-4">
            <h3 className="font-medium">📷 JPG:</h3>
            <ul className="ml-4 space-y-1">
              <li>Small (snake): {images.jpg.small_image_url || 'No disponible'}</li>
              <li>Small (camel): {images.jpg.smallImageUrl || 'No disponible'}</li>
              <li>Medium (snake): {images.jpg.image_url || 'No disponible'}</li>
              <li>Medium (camel): {images.jpg.imageUrl || 'No disponible'}</li>
              <li>Large (snake): {images.jpg.large_image_url || 'No disponible'}</li>
              <li>Large (camel): {images.jpg.largeImageUrl || 'No disponible'}</li>
            </ul>
          </div>
        )}
        
        {images?.webp && (
          <div className="mb-4">
            <h3 className="font-medium">🖼️ WebP:</h3>
            <ul className="ml-4 space-y-1">
              <li>Small (snake): {images.webp.small_image_url || 'No disponible'}</li>
              <li>Small (camel): {images.webp.smallImageUrl || 'No disponible'}</li>
              <li>Medium (snake): {images.webp.image_url || 'No disponible'}</li>
              <li>Medium (camel): {images.webp.imageUrl || 'No disponible'}</li>
              <li>Large (snake): {images.webp.large_image_url || 'No disponible'}</li>
              <li>Large (camel): {images.webp.largeImageUrl || 'No disponible'}</li>
            </ul>
          </div>
        )}
      </div>

      {/* Imágenes seleccionadas por las funciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">🎯 Hero Image (WebP Large → JPG Large):</h2>
          <p className="text-sm text-gray-600 mb-2">{getHeroImage(images)}</p>
          <div className="relative h-64 w-full rounded overflow-hidden">
            <Image 
              src={getHeroImage(images)} 
              alt="Hero" 
              fill 
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">🃏 Card Image (WebP Medium → JPG Medium):</h2>
          <p className="text-sm text-gray-600 mb-2">{getCardImage(images)}</p>
          <div className="relative h-48 w-32 rounded overflow-hidden">
            <Image 
              src={getCardImage(images)} 
              alt="Card" 
              fill 
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">📱 Thumbnail Image (WebP Small → JPG Small):</h2>
          <p className="text-sm text-gray-600 mb-2">{getThumbnailImage(images)}</p>
          <div className="relative h-24 w-24 rounded overflow-hidden">
            <Image 
              src={getThumbnailImage(images)} 
              alt="Thumbnail" 
              fill 
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Datos raw del anime */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">📄 Datos Completos del Anime:</h2>
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(anime, null, 2)}
        </pre>
      </div>
    </div>
  )
} 