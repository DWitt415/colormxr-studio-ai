// next.config.mjs
export default {
  devIndicators: {
    buildActivity: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Disable the persistent webpack cache to prevent ENOENT errors
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};
