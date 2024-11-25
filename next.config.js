/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'images.unsplash.com',
      'njhibesggyagmezbergr.supabase.co', // Supabase storage domain
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com', // Google OAuth avatars
      'openmd.com',
      'images.openmd.com',
    ],
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tiktok.com https://*.facebook.net https://*.facebook.com https://*.instagram.com https://*.pinterest.com;
              style-src 'self' 'unsafe-inline' https://*.facebook.com https://*.instagram.com https://*.pinterest.com https://*.tiktok.com;
              frame-src https://*.facebook.com https://*.instagram.com https://*.pinterest.com https://*.tiktok.com;
              img-src 'self' blob: data: https://*.facebook.com https://*.instagram.com https://*.pinterest.com https://*.fbcdn.net https://*.tiktok.com https://images.unsplash.com https://*.supabase.co https://*.githubusercontent.com https://*.googleusercontent.com;
              connect-src 'self' https://*.facebook.com https://*.instagram.com https://*.pinterest.com https://*.tiktok.com https://*.supabase.co;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ]
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.sql$/,
      use: 'raw-loader',
    });
    return config;
  },
}

module.exports = nextConfig
