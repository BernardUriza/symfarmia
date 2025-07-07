/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  output: process.env.NETLIFY ? 'standalone' : undefined,

  images: {
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

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  experimental: {
    webpackBuildWorker: false,
    forceSwcTransforms: true,
    // Emergency: Disable optimizations that cause hanging
    optimizeCss: false,
    esmExternals: false,
  },
  
  // serverExternalPackages: ['prisma'], // Not available in Next.js 14

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    APP_VERSION: process.env.npm_package_version,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(self), camera=()' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
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

  // turbopack config not available in Next.js 14
  
  webpack: (config, { dev, isServer, webpack }) => {
    // MEDICAL-GRADE MODULE RESOLUTION
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        zlib: false,
      },
      alias: {
        ...config.resolve.alias,
        // Medical-grade path resolution
        '@': '/workspaces/symfarmia',
        '@/components': '/workspaces/symfarmia/src/components',
        '@/app': '/workspaces/symfarmia/app',
        '@/hooks': '/workspaces/symfarmia/hooks',
        '@/lib': '/workspaces/symfarmia/lib',
        '@/utils': '/workspaces/symfarmia/src/utils',
        '@/services': '/workspaces/symfarmia/app/services',
        '@/providers': '/workspaces/symfarmia/app/providers',
      },
      // Bulletproof extension resolution
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.mjs', '.cjs'],
      // Module resolution priorities
      modules: ['node_modules', '/workspaces/symfarmia/node_modules'],
      // Medical-grade symlink handling
      symlinks: false,
      // Bulletproof cache safety
      unsafeCache: false,
      // Ensure consistent resolution
      preferAbsolute: true,
    };

    // MEDICAL-GRADE ERROR HANDLING
    config.plugins.push(
      new webpack.DefinePlugin({
        '__MEDICAL_ERROR_REPORTING__': JSON.stringify(true),
        '__MEDICAL_SYSTEM_VERSION__': JSON.stringify(process.env.npm_package_version || '1.0.0'),
        '__MEDICAL_BUILD_ID__': JSON.stringify(Math.random().toString(36).substr(2, 9)),
      })
    );

    // Add webpack progress plugin for build visibility
    if (!dev) {
      const ProgressPlugin = require('webpack').ProgressPlugin;
      config.plugins.push(
        new ProgressPlugin((percentage, message, ...args) => {
          // Send progress to our enhanced build script
          if (process.send) {
            process.send({
              type: 'webpack-progress',
              percentage: Math.round(percentage * 100),
              message,
              args
            });
          }
        })
      );
    }
    
    // Bundle analyzer in production builds with --analyze flag
    if (!dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : '../analyze/client.html',
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: isServer ? '../analyze/server-stats.json' : '../analyze/client-stats.json',
        })
      );
    }
    
    // EMERGENCY: Disable webpack optimizations that cause hanging
    if (process.env.WEBPACK_MINIMIZE === 'false') {
      config.optimization.minimize = false;
      config.optimization.minimizer = [];
    }
    
    // Reduce memory usage in development
    if (dev) {
      // Simpler chunk configuration for development
      config.optimization.splitChunks = {
        chunks: 'async',
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'async',
            priority: 10,
          },
        },
      };
      
      // Reduce memory usage for Codespaces
      config.optimization.minimize = false;
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.cache = false; // Disable webpack cache
      config.infrastructureLogging = { level: 'error' };
    }

    // Tree shaking optimizations (disabled in dev to save memory)
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Production optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[\\/]/.test(module.identifier());
            },
            name(module) {
              const hash = require('crypto')
                .createHash('sha1')
                .update(module.identifier())
                .digest('hex');
              return hash.substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(module, chunks) {
              return (
                'shared-' +
                require('crypto')
                  .createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex')
                  .substring(0, 8)
              );
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Only apply custom cache groups in production to avoid dev conflicts
    if (!dev) {
      config.optimization.splitChunks.cacheGroups = {
        ...(config.optimization.splitChunks.cacheGroups || {}),
        landingCritical: {
          test: /[\\/]components[\\/](Hero|CTA|Navigation)[\\/]/,
          name: 'landing-critical',
          chunks: 'all',
          priority: 50,
          enforce: true,
        },
        animations: {
          test: /[\\/]node_modules[\\/](framer-motion|three|gsap)[\\/]/,
          name: 'animations',
          chunks: 'all',
          priority: 40,
          enforce: true,
        },
        dashboard: {
          test: /[\\/]components[\\/](dashboard|medical|consultation)[\\/]/,
          name: 'medical-dashboard',
          chunks: 'all',
          priority: 30,
        },
        landingApp: {
          test: /[\\/](pages|components)[\\/](landing|marketing)[\\/]/,
          name: 'landing-app',
          chunks: 'all',
          priority: 50,
        },
        dashboardApp: {
          test: /[\\/](pages|components)[\\/](dashboard|widgets)[\\/]/,
          name: 'dashboard-app',
          chunks: 'all',
          priority: 40,
        },
        transcriptionApp: {
          test: /[\\/](pages|components)[\\/](transcripcion|consultation)[\\/]/,
          name: 'transcription-app',
          chunks: 'all',
          priority: 40,
        },
        patientsApp: {
          test: /[\\/](pages|components)[\\/](pacientes|patients)[\\/]/,
          name: 'patients-app',
          chunks: 'all',
          priority: 30,
        },
        reportsApp: {
          test: /[\\/](pages|components)[\\/](reportes|medical-reports)[\\/]/,
          name: 'reports-app',
          chunks: 'all',
          priority: 30,
        },
        particles: {
          test: /[\\/]components[\\/].*[Pp]article.*[\\/]/,
          name: 'particle-systems',
          chunks: 'async',
          priority: 20,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          maxSize: 244000,
        },
      };
    }
    
    // Add build time stats
    config.plugins.push(
      new webpack.DefinePlugin({
        '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
        '__BUILD_ENV__': JSON.stringify(process.env.NODE_ENV || 'development'),
      })
    );
    
    return config;
  },
};

module.exports = nextConfig;
