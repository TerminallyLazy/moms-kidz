/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['openmd.com', 'images.openmd.com', 'images.unsplash.com'],
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
              img-src 'self' blob: data: https://*.facebook.com https://*.instagram.com https://*.pinterest.com https://*.fbcdn.net https://*.tiktok.com https://images.unsplash.com;
              connect-src 'self' https://*.facebook.com https://*.instagram.com https://*.pinterest.com https://*.tiktok.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
