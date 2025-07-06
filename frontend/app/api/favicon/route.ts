import { SITE_NAME } from '@/lib/siteConfig';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Tomar la primera letra del nombre del sitio
  const letter = SITE_NAME.charAt(0).toUpperCase();

  // SVG personalizado: fondo circular, degradado azul-rosa, letra negra, fuente Montserrat
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3b82f6" />
      <stop offset="1" stop-color="#f472b6" />
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="32" fill="url(#bg)" />
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Montserrat, Arial, sans-serif" font-size="38" font-weight="bold" fill="#222">${letter}</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
} 