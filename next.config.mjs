/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    config.module.rules.push({
      test: /\.worker\.m?js$/,
      use: { loader: "worker-loader" }
    });
    return config;
  }
};

export default nextConfig;
