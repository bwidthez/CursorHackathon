/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      "mongodb-memory-server",
      "mongodb-memory-server-core",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from bundling mongodb-memory-server (Node.js only)
      config.externals = config.externals || [];
      config.externals.push(
        "mongodb-memory-server",
        "mongodb-memory-server-core"
      );
    }
    return config;
  },
};

module.exports = nextConfig;
