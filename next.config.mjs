/** @type {import('next').NextConfig} */
const nextConfig = {
  headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade",
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  redirects() {
    return [
      {
        source: "/account",
        destination: "/account/profile",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      // temorarily as images are hosted on backend
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};
export default nextConfig;
