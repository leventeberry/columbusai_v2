import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Monorepo root so Next.js package and workspace deps resolve in Docker dev (and locally).
    root: path.join(__dirname, "..", ".."),
  },
  serverExternalPackages: ["@columbusai/db", "@prisma/client"],
};

export default nextConfig;
