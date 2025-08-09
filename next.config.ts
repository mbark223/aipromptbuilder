import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configure for large file uploads (4GB)
  api: {
    bodyParser: {
      sizeLimit: '4gb',
    },
  },
};

export default nextConfig;
