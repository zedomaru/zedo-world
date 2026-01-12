import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: isProd ? "export" : undefined,
  basePath: isProd ? "/zedo-world" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
