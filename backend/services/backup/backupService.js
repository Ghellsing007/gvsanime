import { searchAnime } from '../anime/jikanService.js';
import mongoose from '../shared/mongooseClient.js';

// Modelo para el cache de anime en MongoDB
const AnimeCache = mongoose.models.AnimeCache || mongoose.model('AnimeCache', new mongoose.Schema({
  animeId: String,
  data: Object,
  updatedAt: { type: Date, default: Date.now }
}));

// Sincroniza los animes populares desde Jikan y los guarda en MongoDB
export async function runPopularAnimeBackup() {
  try {
    // Buscar los animes más populares (puedes ajustar el query según la API de Jikan)
    const { results } = await searchAnime(''); // '' para traer populares por defecto
    if (!results || results.length === 0) {
      console.log('No se encontraron animes populares para backup.');
      return { success: false, message: 'No se encontraron animes populares.' };
    }
    let count = 0;
    for (const anime of results) {
      const exists = await AnimeCache.findOne({ animeId: anime.mal_id });
      if (!exists) {
        await AnimeCache.create({ animeId: anime.mal_id, data: anime });
        count++;
      }
    }
    console.log(`Backup de animes populares completado. Nuevos animes guardados: ${count}`);
    return { success: true, message: `Backup completado. Nuevos animes: ${count}` };
  } catch (error) {
    console.error('Error en el backup de animes populares:', error);
    return { success: false, message: error.message };
  }
} 