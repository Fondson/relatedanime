/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')

const nextConfig = withPWA({
  pwa: {
    dest: 'public',
  },
  reactStrictMode: true,
  images: {
    domains: ['cdn.myanimelist.net'],
  },
})

module.exports = nextConfig
