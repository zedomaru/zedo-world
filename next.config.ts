import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/zedo-world",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
