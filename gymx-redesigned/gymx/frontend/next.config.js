/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev; connect-src 'self' https://qabfqkvcsbcnerqwcllm.supabase.co wss://qabfqkvcsbcnerqwcllm.supabase.co https://script.google.com https://script.googleusercontent.com https://cdn.jsdelivr.net; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
