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
    api.get('/anime/search?featured=true')
      .then((res: any) => {
        if (res.data.results && res.data.results.length > 0) {
          const firstAnime = res.data.results[0]
          setAnime(firstAnime)
          console.log('🔍 Anime completo:', firstAnime)
          debugImageUrls(firstAnime.images)
        }
      })
      .catch((err: any) => console.error('Error:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Cargando...</div>
  if (!anime) return <div>No se encontró anime</div>

  const images = anime.images as AnimeImages

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
              <li>Small: {images.jpg.smallImageUrl || 'No disponible'}</li>
              <li>Medium: {images.jpg.imageUrl || 'No disponible'}</li>
              <li>Large: {images.jpg.largeImageUrl || 'No disponible'}</li>
            </ul>
          </div>
        )}
        
        {images?.webp && (
          <div className="mb-4">
            <h3 className="font-medium">🖼️ WebP:</h3>
            <ul className="ml-4 space-y-1">
              <li>Small: {images.webp.smallImageUrl || 'No disponible'}</li>
              <li>Medium: {images.webp.imageUrl || 'No disponible'}</li>
              <li>Large: {images.webp.largeImageUrl || 'No disponible'}</li>
            </ul>
          </div>
        )}
      </div>

      {/* Imágenes seleccionadas por las funciones */}
      <div className="space-y-6">
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