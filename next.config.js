/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Prevent static pre-rendering of pages that need Firebase at runtime
  experimental: {},
  // All pages using Firebase will be client-rendered
  output: undefined,
};

module.exports = nextConfig;
