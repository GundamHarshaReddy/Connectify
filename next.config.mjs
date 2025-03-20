import { withLayout } from 'next-compose-plugins';

let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    serverActions: {
      bodySizeLimit: '2mb', // Increase limit for server actions
    },
    optimizePackageImports: ['@/components', '@/lib', '@/utils'],
  },
  compiler: {
    // Enable React optimizations
    reactRemoveProperties: { properties: ['^data-test$'] },
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  // Faster redirects
  redirects() {
    return [
      // Add fast redirects for common paths here if needed
    ]
  },
  // Optimize images
  images: {
    domains: ['images.unsplash.com', 'localhost'], // If you're using unsplash directly
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
