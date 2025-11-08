/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      // temorarily as images are hosted on backend
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "cdn.pups4sale.com.au",
      },
      {
        protocol: "https",
        hostname: "pups4sale.com.au",
      },
      {
        protocol: "http",
        hostname: "pups4sale.com.au",
      },
      {
        protocol: "https",
        hostname: "www.pups4sale.com.au",
      },
    ],
    loader: 'custom',
    loaderFile: './app/_utils/image-loader-custom.ts',
  },
}

module.exports = nextConfig 