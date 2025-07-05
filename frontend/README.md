# 🎨 Frontend - GVS Anime

Frontend de la aplicación GVS Anime construido con Next.js 14, TypeScript y Tailwind CSS.

## 🚀 Características

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animaciones**: Framer Motion
- **HTTP Client**: Axios
- **Estado**: React Hooks

## 📋 Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Backend corriendo en `http://localhost:5000`

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd gvsanime/frontend
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Ejecutar en desarrollo**
   ```bash
   pnpm dev
   # o
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

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
│   ├── api.js           # Cliente HTTP
│   ├── imageUtils.ts    # Utilidades de imágenes
│   ├── types.ts         # Tipos TypeScript
│   └── utils.ts         # Utilidades generales
├── hooks/                # Custom hooks
├── styles/               # Estilos globales
└── public/               # Assets estáticos
```

## 🧩 Componentes Principales

### HeroSection
Carrusel automático de animes destacados con navegación manual.

```tsx
import HeroSection from '@/components/hero-section'

// Uso
<HeroSection />
```

### AnimeCard
Card para mostrar información de anime con múltiples variantes.

```tsx
import AnimeCard from '@/components/anime-card'

// Uso
<AnimeCard
  id={anime.mal_id}
  title={anime.title}
  images={anime.images}
  score={anime.score}
  variant="default"
/>
```

### AnimeDetails
Vista detallada de un anime específico.

```tsx
import AnimeDetails from '@/components/anime-details'

// Uso
<AnimeDetails id="123" />
```

## 🛠️ Utilidades

### imageUtils.ts
Manejo optimizado de imágenes de diferentes calidades.

```tsx
import { getHeroImage, getCardImage } from '@/lib/imageUtils'

// Imagen de alta calidad para hero
const heroImage = getHeroImage(anime.images)

// Imagen de calidad media para cards
const cardImage = getCardImage(anime.images)
```

### api.js
Cliente HTTP configurado para el backend.

```tsx
import api from '@/lib/api'

// GET request
const response = await api.get('/anime/search?featured=true')

// POST request
const response = await api.post('/auth/login', { email, password })
```

### types.ts
Tipos TypeScript centralizados para toda la aplicación.

```tsx
import type { Anime, User, AnimeReview } from '@/lib/types'
```

## 🎨 Styling

### Tailwind CSS
Utilizamos Tailwind CSS para el styling con un tema personalizado.

```tsx
// Clases de ejemplo
<div className="bg-background text-foreground p-4 rounded-lg">
  <h1 className="text-2xl font-bold text-primary">Título</h1>
</div>
```

### shadcn/ui
Componentes de UI reutilizables y accesibles.

```tsx
import { Button, Card, Input } from '@/components/ui'

// Uso
<Button variant="default">Click me</Button>
<Card className="p-4">Contenido</Card>
<Input placeholder="Buscar anime..." />
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linting
pnpm lint

# Type checking
pnpm type-check

# Formatear código
pnpm format
```

## 📱 Responsive Design

La aplicación está optimizada para diferentes tamaños de pantalla:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🌙 Tema Oscuro/Claro

Soporte para tema oscuro y claro con persistencia de preferencias.

```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()

// Cambiar tema
setTheme('dark')
setTheme('light')
setTheme('system')
```

## 🔐 Autenticación

Sistema de autenticación con JWT y protección de rutas.

```tsx
// Proteger rutas
import { useAuth } from '@/hooks/useAuth'

const { user, isLoading } = useAuth()

if (isLoading) return <Loading />
if (!user) return <Login />
```

## 📊 Estado de Desarrollo

- ✅ **Setup inicial** - Completado
- ✅ **Componentes core** - Completado
- ✅ **Páginas principales** - Completado
- ✅ **Sistema de imágenes** - Completado
- 🔄 **Autenticación** - En progreso
- 🔄 **Funcionalidades de usuario** - Pendiente
- 🔄 **Testing** - Pendiente

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 📦 Build y Deploy

### Build de Producción
```bash
pnpm build
```

### Variables de Entorno de Producción
```env
NEXT_PUBLIC_API_URL=https://api.gvsanime.com
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://gvsanime.com
```

### Deploy en Vercel
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (`AnimeCard.tsx`)
- **Utilidades**: camelCase (`imageUtils.ts`)
- **Tipos**: PascalCase (`Anime`, `User`)
- **Constantes**: UPPER_SNAKE_CASE
- **Funciones**: camelCase

### Estructura de Componentes
```tsx
// 1. Imports
import React from 'react'
import { ComponentProps } from './types'

// 2. Interface
interface ComponentProps {
  // props
}

// 3. Componente
export default function Component({ prop }: ComponentProps) {
  // lógica
  
  return (
    // JSX
  )
}
```

## 🐛 Troubleshooting

### Error de imágenes
Si las imágenes no cargan, verificar:
1. Configuración de `next.config.mjs`
2. Dominios remotos configurados
3. URLs de imágenes válidas

### Error de API
Si hay errores de API:
1. Verificar que el backend esté corriendo
2. Revisar `NEXT_PUBLIC_API_URL`
3. Verificar CORS en el backend

### Error de TypeScript
Si hay errores de tipos:
1. Ejecutar `pnpm type-check`
2. Verificar imports de tipos
3. Actualizar `types.ts` si es necesario

## 📚 Recursos Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por el equipo de GVS Anime** 