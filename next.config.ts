import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.movetoisrael.fyi" }],
        destination: "https://movetoisrael.fyi/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
