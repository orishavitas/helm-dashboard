import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  transpilePackages: [
    // react-force-graph-2d ships as CJS; transpile for ESM output
    "react-force-graph-2d",
    "force-graph",
    "d3-force-3d",
    "three",
    "three-forcegraph",
    "three-render-objects",
    "kapsule",
    "accessor-fn",
  ],
};

export default nextConfig;
