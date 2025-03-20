const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['leaflet'],
  webpack: (config, { dev, isServer }) => {
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      },
      // Use absolute path for cache directory
      cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
      maxAge: 31536000000 // 1 year
    }
    return config
  },
}

module.exports = nextConfig
