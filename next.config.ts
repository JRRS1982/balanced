import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Output standalone for Docker
  output: 'standalone',
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
};

export default nextConfig;
