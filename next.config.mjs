import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  // Note: cacheComponents (PPR) requires removing "export const dynamic" from all pages
  // Enable when ready to refactor: cacheComponents: true,

  // Security headers for all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Content Security Policy - adjust as needed
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://s3.tradingview.com https://s.tradingview.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.binance.com wss://stream.binance.com https://api.frankfurter.app https://*.neon.tech https://*.vercel.app https://s3.tradingview.com https://s.tradingview.com",
              "frame-src 'self' https://s3.tradingview.com https://s.tradingview.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      // Cache static assets (logos, icons, images) for 1 year
      {
        source: "/crypto/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/currencies/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Stricter headers for API routes
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hatscripts.github.io",
        port: "",
        pathname: "/circle-flags/flags/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/spothq/cryptocurrency-icons/**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // Cache images for 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256, 384],
  },
  // Turbopack config for Next.js 16 (replaces webpack)
  turbopack: {
    rules: {
      "*.glsl": {
        loaders: ["raw-loader"],
      },
      "*.vs": {
        loaders: ["raw-loader"],
      },
      "*.fs": {
        loaders: ["raw-loader"],
      },
      "*.vert": {
        loaders: ["raw-loader"],
      },
      "*.frag": {
        loaders: ["raw-loader"],
      },
    },
  },

  // Experimental features - increase body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default withBundleAnalyzer(nextConfig);
