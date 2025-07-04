// unifiedSearchService.js
// Servicio de búsqueda unificada de anime en múltiples APIs externas

import { searchAnime as searchJikan } from './jikanService.js';
import { normalizeJikanResults } from './normalizers/jikanNormalizer.js';

export async function unifiedAnimeSearch(query) {
  // 1. Buscar en Jikan
  let results = await searchJikan(query);
  if (results && results.length > 0) {
    return {
      source: 'jikan',
      results: normalizeJikanResults(results)
    };
  }

  // 2. Aquí se pueden agregar más APIs en el futuro
  // Ejemplo:
  // results = await searchAnilist(query);
  // if (results && results.length > 0) {
  //   return { source: 'anilist', results: normalizeAnilistResults(results) };
  // }

  // 3. Si ninguna API devuelve resultados
  return { source: null, results: [] };
} 