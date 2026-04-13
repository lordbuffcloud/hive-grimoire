import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://ck42x.com",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://ck42x.com https://*.ck42x.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
