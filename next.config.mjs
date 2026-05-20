const isProd = process.env.NODE_ENV === "production";
const assetPrefix = isProd ? "/office" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix,
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    NEXT_PUBLIC_ASSET_PREFIX: assetPrefix,
  },
  async rewrites() {
    return [
      {
        source: "/office/_next/:path*",
        destination: "/_next/:path*",
      },
      {
        source: "/office/:file(logo1\\.svg)",
        destination: "/:file",
      },
    ];
  },
};

export default nextConfig;
