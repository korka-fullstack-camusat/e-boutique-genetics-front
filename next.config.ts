import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compresse les réponses HTTP (gzip/brotli)
  compress: true,

  // Optimisation des images Next.js (next/image)
  images: {
    formats: ["image/avif", "image/webp"],
    // Autorise les images depuis n'importe quel domaine externe
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },

  // En-têtes de cache pour les assets statiques
  async headers() {
    const headers = [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "SAMEORIGIN" },
        ],
      },
    ];

    // Cache long pour les fichiers statiques (JS, CSS, images) — uniquement en
    // production, car en dev (Turbopack) les chemins ne sont pas hashés et un
    // cache "immutable" empêcherait le navigateur de voir les changements de code.
    if (process.env.NODE_ENV === "production") {
      headers.push({
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      });
    }

    return headers;
  },
};

export default nextConfig;
