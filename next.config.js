/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  images: {
    unoptimized: true,
  },

  // Memory optimizations for Next.js 15+
  experimental: {
    webpackMemoryOptimizations: true,
    cpus: 1,
  },

  // Dev server configuration
  devIndicators: {
    position: 'bottom-right',
  },

  // Optimize Fast Refresh
  reactStrictMode: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    // Remove custom CSS rules that conflict with Next.js built-in CSS support
    return config;
  },

  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, GET, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
