/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;
