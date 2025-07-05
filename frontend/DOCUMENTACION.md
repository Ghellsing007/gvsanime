# Documentación del Frontend - GVS Anime

## 📋 Índice
- [Arquitectura General](#arquitectura-general)
- [Componentes Implementados](#componentes-implementados)
- [Utilidades y Helpers](#utilidades-y-helpers)
- [Configuraciones](#configuraciones)
- [Estado de Implementación](#estado-de-implementación)
- [Tareas Pendientes](#tareas-pendientes)
- [Guías de Desarrollo](#guías-de-desarrollo)

---

## 🏗️ Arquitectura General

### Stack Tecnológico
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animaciones**: Framer Motion
- **HTTP Client**: Axios
- **Estado**: React Hooks (useState, useEffect)

### Estructura de Carpetas
```
frontend/
├── app/                    # App Router de Next.js
│   ├── anime/[id]/        # Página de detalles de anime
│   ├── auth/login/        # Página de login
│   ├── explorar/          # Página de exploración
│   └── api/               # API Routes
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── *.tsx             # Componentes específicos
├── lib/                  # Utilidades y configuraciones
├── hooks/                # Custom hooks
├── styles/               # Estilos globales
└── public/               # Assets estáticos
```

---

## 🧩 Componentes Implementados

### ✅ Componentes Principales

#### 1. **HeroSection** (`components/hero-section.tsx`)
- **Estado**: ✅ Implementado
- **Funcionalidad**: 
  - Carrusel automático de animes destacados
  - Navegación manual con indicadores
  - Animaciones con Framer Motion
  - Manejo de imágenes optimizado
- **Props**: Ninguna (datos desde API)
- **Dependencias**: `imageUtils`, `framer-motion`, `lucide-react`

#### 2. **AnimeCard** (`components/anime-card.tsx`)
- **Estado**: ✅ Implementado
- **Funcionalidad**:
  - 3 variantes: `default`, `compact`, `featured`
  - Botones de favorito y watchlist
  - Tooltips informativos
  - Animaciones hover
- **Props**:
  ```typescript
  interface AnimeCardProps {
    id: number
    title: string
    images?: AnimeImages
    score?: number
    episodes?: number
    genres?: string[]
    year?: number
    season?: string
    variant?: "default" | "compact" | "featured"
  }
  ```

#### 3. **AnimeDetails** (`components/anime-details.tsx`)
- **Estado**: ✅ Implementado
- **Funcionalidad**:
  - Vista detallada de anime
  - Botones de favorito y watchlist
  - Información completa del anime
- **Props**: `{ id: string }`

#### 4. **AnimeList** (`components/anime-list.tsx`)
- **Estado**: ✅ Implementado
- **Funcionalidad**:
  - Lista paginada de animes
  - Búsqueda en tiempo real
  - Filtros básicos
- **Props**: Ninguna (datos desde API)

#### 5. **Navbar** (`components/navbar.tsx`)
- **Estado**: ✅ Implementado
- **Funcionalidad**:
  - Navegación principal
  - Búsqueda global
  - Menú de usuario
- **Props**: Ninguna

#### 6. **Footer** (`components/footer.tsx`)
- **Estado**: ✅ Implementado
- **Funcionalidad**: Enlaces y información del sitio

### ✅ Componentes de UI (shadcn/ui)
- **Estado**: ✅ Todos implementados
- **Componentes disponibles**:
  - Button, Input, Card, Dialog, Modal
  - Tooltip, Dropdown, Select, Checkbox
  - Tabs, Accordion, Alert, Badge
  - Y muchos más...

---

## 🛠️ Utilidades y Helpers

### ✅ **imageUtils.ts** (`lib/imageUtils.ts`)
- **Estado**: ✅ Implementado y optimizado
- **Funcionalidad**:
  ```typescript
  // Funciones principales
  getAnimeImage(images, options)     // Imagen con opciones personalizadas
  getHeroImage(images)               // WebP large → JPG large (prioridad WebP)
  getCardImage(images)               // WebP medium → JPG medium (prioridad WebP)
  getThumbnailImage(images)          // WebP small → JPG small (prioridad WebP)
  getWebPImage(images, quality)      // Imagen específica en formato WebP
  hasImage(images)                   // Verificar si existe imagen
  debugImageUrls(images)             // Debug: mostrar todas las URLs disponibles
  ```
- **Optimizaciones**:
  - Prioriza WebP sobre JPG para mejor calidad y menor tamaño
  - Fallback automático a JPG si WebP no está disponible
  - Calidad large para hero, medium para cards, small para thumbnails

### ✅ **types.ts** (`lib/types.ts`)
- **Estado**: ✅ Implementado
- **Funcionalidad**: Tipos TypeScript centralizados
- **Interfaces principales**:
  - `Anime` - Estructura completa de anime
  - `User` - Datos de usuario
  - `AnimeReview` - Reviews de anime
  - `AnimeComment` - Comentarios
  - `SearchFilters` - Filtros de búsqueda
  - `ApiResponse<T>` - Respuestas de API
  - Y muchos más...

### ✅ **api.js** (`lib/api.js`)
- **Estado**: ✅ Implementado
- **Funcionalidad**: Cliente Axios configurado para el backend
- **Configuración**: URL base desde `NEXT_PUBLIC_API_URL`

### ✅ **utils.ts** (`lib/utils.ts`)
- **Estado**: ✅ Implementado
- **Funcionalidad**: Utilidades generales (cn, formatDate, etc.)

### ✅ **siteConfig.ts** (`lib/siteConfig.ts`)
- **Estado**: ✅ Implementado
- **Funcionalidad**: Configuración del sitio

---

## ⚙️ Configuraciones

### ✅ **Next.js** (`next.config.mjs`)
- **Estado**: ✅ Configurado
- **Configuraciones**:
  - ESLint y TypeScript ignorados en build
  - Imágenes optimizadas
  - Dominios remotos configurados:
    - `cdn.myanimelist.net`
    - `gogocdn.net`

### ✅ **Tailwind CSS** (`tailwind.config.ts`)
- **Estado**: ✅ Configurado
- **Características**:
  - Tema personalizado
  - Colores del sistema
  - Animaciones personalizadas

### ✅ **TypeScript** (`tsconfig.json`)
- **Estado**: ✅ Configurado
- **Configuraciones**: Paths, strict mode, etc.

---

## 📊 Estado de Implementación

### ✅ **Páginas Implementadas**
1. **Home** (`app/page.tsx`) - ✅ Completa
2. **Explorar** (`app/explorar/page.tsx`) - ✅ Completa
3. **Detalles de Anime** (`app/anime/[id]/page.tsx`) - ✅ Completa
4. **Login** (`app/auth/login/page.tsx`) - ✅ Completa

### ✅ **Funcionalidades Implementadas**
- ✅ Navegación entre páginas
- ✅ Búsqueda de animes
- ✅ Visualización de detalles
- ✅ Sistema de imágenes optimizado
- ✅ Animaciones y transiciones
- ✅ Responsive design
- ✅ Tema oscuro/claro

### ⚠️ **Funcionalidades Parciales**
- 🔄 Autenticación (UI lista, backend pendiente)
- 🔄 Favoritos (UI lista, backend pendiente)
- 🔄 Watchlist (UI lista, backend pendiente)
- 🔄 Comentarios (UI básica, backend pendiente)

---

## 📝 Tareas Pendientes

### 🔥 **Prioridad Alta**

#### 1. **Sistema de Autenticación**
- [ ] Implementar registro de usuarios
- [ ] Integrar con backend de autenticación
- [ ] Proteger rutas privadas
- [ ] Manejo de sesiones
- [ ] Recuperación de contraseña

#### 2. **Funcionalidades de Usuario**
- [ ] Sistema de favoritos funcional
- [ ] Sistema de watchlist funcional
- [ ] Sistema de ratings
- [ ] Historial de visualización
- [ ] Recomendaciones personalizadas

#### 3. **Sistema de Comentarios**
- [ ] Comentarios en animes
- [ ] Respuestas a comentarios
- [ ] Moderación de comentarios
- [ ] Notificaciones

### 🔶 **Prioridad Media**

#### 4. **Mejoras de UX/UI**
- [ ] Loading states mejorados
- [ ] Error boundaries
- [ ] Skeleton loaders
- [ ] Infinite scroll
- [ ] Filtros avanzados

#### 5. **Optimizaciones**
- [ ] Lazy loading de imágenes
- [ ] Code splitting
- [ ] Service Worker para cache
- [ ] PWA features

#### 6. **Funcionalidades Avanzadas**
- [ ] Sistema de foros
- [ ] Reviews de usuarios
- [ ] Comparador de animes
- [ ] Calendario de estrenos

### 🔵 **Prioridad Baja**

#### 7. **Características Adicionales**
- [ ] Modo offline
- [ ] Notificaciones push
- [ ] Exportar/importar datos
- [ ] Temas personalizables
- [ ] Estadísticas de usuario

---

## 🚀 Guías de Desarrollo

### **Agregando un Nuevo Componente**

1. **Crear el archivo** en `components/`
2. **Definir la interfaz** de props
3. **Implementar la funcionalidad**
4. **Agregar estilos** con Tailwind
5. **Documentar** en este archivo
6. **Probar** en diferentes dispositivos

### **Agregando una Nueva Página**

1. **Crear la carpeta** en `app/`
2. **Crear `page.tsx`**
3. **Implementar la lógica**
4. **Agregar a la navegación**
5. **Probar la ruta**

### **Manejo de Imágenes**

```typescript
// Importar las utilidades
import { getHeroImage, getCardImage } from '../lib/imageUtils'

// Usar según el contexto
<Image src={getHeroImage(anime.images)} alt={anime.title} />
<Image src={getCardImage(anime.images)} alt={anime.title} />
```

### **Convenciones de Código**

- **Componentes**: PascalCase (`AnimeCard.tsx`)
- **Utilidades**: camelCase (`imageUtils.ts`)
- **Tipos**: PascalCase con `I` prefix (`IAnime`)
- **Constantes**: UPPER_SNAKE_CASE
- **Funciones**: camelCase

---

## 📈 Métricas de Progreso

### **Componentes**: 15/20 (75%)
### **Páginas**: 4/8 (50%)
### **Utilidades**: 6/8 (75%)
### **Funcionalidades**: 8/15 (53%)

**Progreso General**: 63% completado

---

## 🔗 Enlaces Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Backend API Documentation](./../backend/README.md)
- [README del Frontend](./README.md)
- [Checklist de Desarrollo](./CHECKLIST.md)

---

*Última actualización: $(date)*
*Versión del documento: 1.0* 