/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['react-leaflet', 'leaflet', '@react-leaflet/core'],
  productionBrowserSourceMaps: false,
  // Suppress source map warnings
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Use eval-source-map for faster builds, but suppress warnings
      config.devtool = 'eval-cheap-module-source-map';
    }
    return config;
  },
  // Suppress console warnings about source maps
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
