/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  
  images: {
    unoptimized: true,
  },

  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers']
  },

  // Webpack configuration only for production builds
  ...(process.env.NODE_ENV === 'production' && {
    webpack: (config, { dev, isServer }) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      return config;
    },
  }),

  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ],
      },
    ];
  },
};

module.exports = nextConfig;