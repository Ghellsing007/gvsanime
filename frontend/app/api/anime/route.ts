import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Obtenemos los parámetros de la URL
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "12"
    const q = searchParams.get("q") || ""

    // Construimos la URL de la API de Jikan
    let apiUrl = `https://api.jikan.moe/v4/anime?page=${page}&limit=${limit}`

    // Añadimos el parámetro de búsqueda si existe
    if (q) {
      apiUrl += `&q=${encodeURIComponent(q)}`
    }

    // Realizamos la petición a la API
    const response = await fetch(apiUrl, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status}`)
    }

    const data = await response.json()

    // Devolvemos los datos
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error al obtener datos de anime" }, { status: 500 })
  }
}

