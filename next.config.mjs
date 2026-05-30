/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

// Multi-Zones setup (matches geiger-notes): the office app owns the /office
// prefix via basePath, and geiger-dash forwards /office/* WITHOUT stripping it.
// basePath auto-prefixes routes, API routes, _next assets, and RSC/segment
// prefetches, so everything resolves correctly behind the proxy.
const nextConfig = {
  basePath: isProd ? "/office" : "",
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/office" : "",
  },
};

export default nextConfig;
