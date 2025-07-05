# Cambios en la estructura de datos de animes (junio 2024)

## Mejoras en la estructura de imágenes

Ahora todos los métodos de obtención de animes (`getFeaturedAnime`, `getTopAnime`, `getRecentAnime`, `getAnimeBySeason`, `getAnimeByGenre`) devuelven el objeto completo `images` (con variantes JPG y WebP, y sus tamaños), en vez de solo una URL de imagen. Esto permite al frontend seleccionar la mejor calidad y formato disponible (por ejemplo, WebP large para banners).

### Ejemplo de estructura devuelta:
```json
{
  "id": 123,
  "title": "Nombre del anime",
  "images": {
    "jpg": {
      "image_url": "...",
      "small_image_url": "...",
      "large_image_url": "..."
    },
    "webp": {
      "image_url": "...",
      "small_image_url": "...",
      "large_image_url": "..."
    }
  },
  ...
}
```

## Refrescar el caché para ver los cambios

Para que el frontend reciba la nueva estructura, es necesario **borrar los documentos de caché** en MongoDB:

- `FeaturedAnimeCache`
- `TopAnimeCache`
- `RecentAnimeCache`
- (Opcional: otros caches relacionados)

### ¿Por qué es necesario?
El caché puede tener la estructura antigua (`image: ...`). Si no se borra, el backend seguirá devolviendo la versión vieja hasta que expire el caché.

### ¿Cómo borrar el caché?

Puedes hacerlo desde la consola de MongoDB:
```js
// Conéctate a la base de datos y ejecuta:
db.FeaturedAnimeCache.deleteMany({})
db.TopAnimeCache.deleteMany({})
db.RecentAnimeCache.deleteMany({})
```
O usando una herramienta visual como MongoDB Compass.

Luego, al refrescar el frontend, el backend volverá a consultar Jikan y guardará los datos con la nueva estructura.

---

**Nota:** Si tienes otros métodos de caché personalizados, revisa si también usan la propiedad `image` y actualízalos a `images`. 