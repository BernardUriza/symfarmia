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
    // En Netlify, NO usar export - usar configuración estándar
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

  // Configuración de orígenes permitidos
  allowedDevOrigins: [
    'http://127.0.0.1:3000', 
    'http://localhost:3000',
    'http://127.0.0.1:3002',
    'http://localhost:3002',
    'http://127.0.0.1:*',
    'http://localhost:*'
  ],
  
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: '**.edgestore.dev' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    // Desoptimizar imágenes en Netlify para evitar problemas
    ...(process.env.NETLIFY && { unoptimized: true })
  },

  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Turbopack solo en desarrollo
  turbopack: process.env.NODE_ENV === 'development' ? {
    rules: {
      '*.{svg,eot,ttf,woff,woff2}': {
        loaders: ['@vercel/turbopack-loader-font'],
        as: 'font'
      }
    },
    resolveAlias: {
      '@': '/workspaces/symfarmia',
      '@/components': '/workspaces/symfarmia/src/components',
      '@/app': '/workspaces/symfarmia/app',
      '@/hooks': '/workspaces/symfarmia/hooks',
      '@/lib': '/workspaces/symfarmia/lib',
      '@/utils': '/workspaces/symfarmia/src/utils',
      '@/services': '/workspaces/symfarmia/app/services',
      '@/providers': '/workspaces/symfarmia/app/providers'
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.mjs', '.cjs']
  } : undefined,

  experimental: {
    optimizeCss: false,
    // Configuración específica para @xenova/transformers en Netlify
    ...(process.env.NETLIFY && {
      serverComponentsExternalPackages: ['@xenova/transformers']
    })
  },

  // Webpack solo para producción
  ...(process.env.NODE_ENV === 'production' && {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      if (!dev) {
        // Configuración específica para @xenova/transformers
        config.resolve.alias = {
          ...config.resolve.alias,
          '@xenova/transformers': '@xenova/transformers/dist/transformers.min.js'
        };
        
        // Optimización para Netlify
        if (process.env.NETLIFY) {
          config.optimization.splitChunks = {
            chunks: 'all',
            cacheGroups: {
              transformers: {
                test: /[\\/]node_modules[\\/]@xenova[\\/]/,
                name: 'transformers',
                chunks: 'async',
              }
            }
          };
        }
        
        // Font handling para producción
        config.module.rules.push({
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash][ext]'
          }
        });
      }
      return config;
    }
  }),

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
          // Headers específicos para API de transcripción
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Headers específicos para archivos de modelo
      {
        source: '/:path*.wasm',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/models/:path*.bin',
        headers: [
          { key: 'Content-Type', value: 'application/octet-stream' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
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