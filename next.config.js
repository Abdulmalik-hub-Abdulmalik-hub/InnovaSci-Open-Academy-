/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
