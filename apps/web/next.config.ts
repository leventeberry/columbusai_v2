import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@columbusai/db", "@prisma/client"],
};

export default nextConfig;
