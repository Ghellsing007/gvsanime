import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Obtenemos los parámetros de la URL
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "12"
    const q = searchParams.get("q") || ""

    // Obtenemos la URL del backend desde las variables de entorno
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    
    // Construimos la URL de nuestro backend
    let apiUrl = `${backendUrl}/anime/search?page=${page}&limit=${limit}`

    // Añadimos el parámetro de búsqueda si existe
    if (q) {
      apiUrl += `&q=${encodeURIComponent(q)}`
    }

    // Realizamos la petición a nuestro backend que tiene caché en MongoDB
    const response = await fetch(apiUrl, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status}`)
    }

    const data = await response.json()

    // Devolvemos los datos tal como los devuelve nuestro backend
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error al obtener datos de anime" }, { status: 500 })
  }
}

