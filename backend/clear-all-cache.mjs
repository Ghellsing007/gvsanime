// clear-all-cache.mjs
// Script para limpiar todos los caches y forzar regeneración con datos normalizados

import { cleanAllCache } from './services/anime/animeAggregator.js';
import mongoose from './services/shared/mongooseClient.js';

async function clearAllCaches() {
  try {
    console.log('🧹 Iniciando limpieza de todos los caches...');
    
    // Limpiar cachés principales
    const result = await cleanAllCache();
    console.log('✅ Cachés principales limpiados:', result);
    
    // Definir los modelos de caché directamente
    const AnimeCache = mongoose.models.AnimeCache || mongoose.model('AnimeCache', new mongoose.Schema({
      animeId: String,
      data: Object,
      updatedAt: { type: Date, default: Date.now }
    }));
    
    const SearchCache = mongoose.models.SearchCache || mongoose.model('SearchCache', new mongoose.Schema({
      query: String,
      results: Array,
      source: String,
      animeIds: Array,
      updatedAt: { type: Date, default: Date.now }
    }));
    
    const TopAnimeCache = mongoose.models.TopAnimeCache || mongoose.model('TopAnimeCache', new mongoose.Schema({
      animes: Array,
      updatedAt: { type: Date, default: Date.now }
    }));
    
    const RecentAnimeCache = mongoose.models.RecentAnimeCache || mongoose.model('RecentAnimeCache', new mongoose.Schema({
      animes: Array,
      updatedAt: { type: Date, default: Date.now }
    }));
    
    const FeaturedAnimeCache = mongoose.models.FeaturedAnimeCache || mongoose.model('FeaturedAnimeCache', new mongoose.Schema({
      animes: Array,
      updatedAt: { type: Date, default: Date.now }
    }));
    
    const GenreCache = mongoose.models.GenreCache || mongoose.model('GenreCache', new mongoose.Schema({
      genres: Array,
      updatedAt: { type: Date, default: Date.now }
    }));
    
    const ReviewCache = mongoose.models.ReviewCache || mongoose.model('ReviewCache', new mongoose.Schema({
      animeId: String,
      reviews: Array,
      updatedAt: { type: Date, default: Date.now }
    }));
    
    // Limpiar todos los caches
    const topResult = await TopAnimeCache.deleteMany({});
    console.log('✅ TopAnimeCache limpiado:', topResult.deletedCount, 'documentos');
    
    const recentResult = await RecentAnimeCache.deleteMany({});
    console.log('✅ RecentAnimeCache limpiado:', recentResult.deletedCount, 'documentos');
    
    const featuredResult = await FeaturedAnimeCache.deleteMany({});
    console.log('✅ FeaturedAnimeCache limpiado:', featuredResult.deletedCount, 'documentos');
    
    const genreResult = await GenreCache.deleteMany({});
    console.log('✅ GenreCache limpiado:', genreResult.deletedCount, 'documentos');
    
    const reviewResult = await ReviewCache.deleteMany({});
    console.log('✅ ReviewCache limpiado:', reviewResult.deletedCount, 'documentos');
    
    console.log('🎉 ¡Todos los caches han sido limpiados exitosamente!');
    console.log('📝 Los próximos requests generarán datos con imágenes normalizadas.');
    
  } catch (error) {
    console.error('❌ Error limpiando caches:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada.');
  }
}

// Ejecutar la limpieza
clearAllCaches(); 