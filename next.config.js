// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     // Warning: This allows production builds to successfully complete even if
//     // your project has ESLint errors.
//     ignoreDuringBuilds: true
//   },
//   typescript: {
//     // !! WARN !!
//     // Dangerously allow production builds to successfully complete even if
//     // your project has type errors.
//     // !! WARN !!
//     ignoreBuildErrors: true
//   },
//   webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
//     config.resolve.alias.canvas = false;
//     config.resolve.alias.encoding = false;
//     return config;
//   }
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/sign-in",
        destination: "/api/auth/login",
        permanent: true
      },
      {
        source: "/sign-up",
        destination: "/api/auth/register",
        permanent: true
      }
    ];
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  }
};

module.exports = nextConfig;
