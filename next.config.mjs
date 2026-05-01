/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              // Only load resources from your own domain by default
              "default-src 'self'",

              // Scripts: self only. 'unsafe-inline' needed for Next.js inline scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

              // Styles: self + Google Fonts (used by next/font/google)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Fonts: self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com",

              // Images: self + your remotePatterns hosts
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://img.freepik.com https://res.cloudinary.com",

              // API calls: self + Google OAuth endpoints (for Auth.js Google provider)
              "connect-src 'self' https://accounts.google.com",

              // Auth.js Google sign-in popup/redirect
              "frame-src 'self' https://accounts.google.com",

              // No objects/embeds allowed
              "object-src 'none'",

              // Forces all resources to be loaded over HTTPS
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
