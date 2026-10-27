/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Automatic memoisation of components and hooks (avoids unnecessary renders).
  reactCompiler: true,
  turbopack: {
    rules: {
      // Only the Tailwind entry needs the Tailwind loader. CSS Modules stay untouched,
      // so their class names remain locally scoped.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    localPatterns: [{ pathname: "/media/**", search: "" }],
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
