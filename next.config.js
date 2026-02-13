// next.config.js
module.exports = {
  devIndicators: false,
  webpack: (config, { dev, isServer }) => {
    // Disable the persistent webpack cache to prevent ENOENT errors
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};