// jikanService.js
// Cliente para la Jikan API (https://docs.api.jikan.moe/)
// Permite obtener datos de anime desde MyAnimeList usando la API pública de Jikan

import axios from 'axios';

// Leer la URL base de Jikan desde el .env
const JIKAN_BASE_URL = process.env.JIKAN_BASE_URL || 'https://api.jikan.moe/v4';

// Función para obtener datos de anime por ID de MyAnimeList
export async function getAnimeById(malId) {
  const url = `${JIKAN_BASE_URL}/anime/${malId}`;
  try {
    const response = await axios.get(url);
    return response.data.data;
  } catch (err) {
    console.error('Error en getAnimeById:', err.message);
    throw err;
  }
}

// Función para buscar anime por nombre
export async function searchAnime(query) {
  try {
    const { data } = await axios.get(`${JIKAN_BASE_URL}/anime`, {
      params: { q: query, limit: 5 },
    });
    return data.data;
  } catch (error) {
    console.error('Error buscando anime:', error.message);
    return [];
  }
}

/*
Explicación:
- Ahora la URL base de Jikan se lee desde process.env.JIKAN_BASE_URL, permitiendo cambiarla fácilmente desde el .env.
- Si no está definida, usa el valor por defecto oficial.
*/ 