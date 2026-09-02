/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Placeholder artwork is served as local SVG files (see /scripts/generate-images.mjs).
    // Optimization is disabled so SVG sources are served directly and reliably
    // on any machine (next/image still handles lazy-loading, priority & layout).
    unoptimized: true,
  },
};

export default nextConfig;
