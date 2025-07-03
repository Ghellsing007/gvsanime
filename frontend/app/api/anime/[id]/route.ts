import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Realizamos la petición a la API de Jikan para obtener un anime específico
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status}`)
    }

    const data = await response.json()

    // Devolvemos los datos
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error al obtener detalles del anime" }, { status: 500 })
  }
}

