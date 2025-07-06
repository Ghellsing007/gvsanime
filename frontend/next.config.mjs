/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'gogocdn.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.1.7:3000', // Cambia esta IP por la de tu PC si es diferente
  ],
}

export default nextConfig
