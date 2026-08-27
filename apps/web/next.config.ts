import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/profile/resume/pdf": ["./fonts/**/*"],
  },
};

export default nextConfig;
