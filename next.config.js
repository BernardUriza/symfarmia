let withPWA = (config) => config;
try {
  const pwa = require('next-pwa');
  withPWA = pwa({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/app-build-manifest\.json$/],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
  });
} catch (err) {
  console.warn('next-pwa not available, skipping PWA setup');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Detectar entorno de Netlify y configurar output apropiado
  ...(process.env.NETLIFY && {
    trailingSlash: true,
    images: {
      unoptimized: true // Para compatibilidad con Netlify
    }
  }),
  
  // Solo usar export para builds manuales, NO en Netlify
  ...(process.env.MANUAL_EXPORT && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // CRÍTICO: Deshabilitar Sharp en Netlify
  images: {
    unoptimized: true, // Deshabilita Sharp completamente
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: '**.edgestore.dev' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  experimental: {
    optimizeCss: false,
    // Configuración específica para @xenova/transformers en Netlify
    serverComponentsExternalPackages: ['@xenova/transformers']
  },

  // Webpack configuración mínima
  webpack: (config, { dev, isServer }) => {
    // Solo en producción
    if (!dev && !isServer) {
      // Ignorar sharp para evitar errores de build
      config.resolve.alias = {
        ...config.resolve.alias,
        'sharp$': false,
      };
      
      // Configuración para @xenova/transformers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(self), camera=(self)' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
    ];
  },
};

module.exports = withPWA(nextConfig);