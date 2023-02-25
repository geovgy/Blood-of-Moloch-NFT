const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')(['@raidguild/design-system']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
}

module.exports = withPlugins([withTM], nextConfig);
