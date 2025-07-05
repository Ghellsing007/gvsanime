import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Obtenemos la URL del backend desde las variables de entorno
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    
    // Realizamos la petición a nuestro backend que tiene caché en MongoDB
    const response = await fetch(`${backendUrl}/anime/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status}`)
    }

    const data = await response.json()

    // Devolvemos los datos tal como los devuelve nuestro backend
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error al obtener detalles del anime" }, { status: 500 })
  }
}

