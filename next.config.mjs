/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  // Note: cacheComponents (PPR) requires removing "export const dynamic" from all pages
  // Enable when ready to refactor: cacheComponents: true,
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
    ],
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
};

export default nextConfig;
