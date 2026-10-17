import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Pages that were merged or removed: keep old links and search results working.
  async redirects() {
    return [
      { source: '/about', destination: '/', permanent: true },
      { source: '/how-it-works', destination: '/#how', permanent: true },
      { source: '/support-interest', destination: '/get-involved', permanent: true },
      { source: '/business-interest', destination: '/get-involved?form=business', permanent: true },
      { source: '/contact', destination: '/get-involved?form=question', permanent: true },
      { source: '/shop', destination: '/', permanent: true },
      { source: '/cart', destination: '/', permanent: true },
      { source: '/legal/shipping', destination: '/', permanent: true },
    ]
  },
}

export default nextConfig
