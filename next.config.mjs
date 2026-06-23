/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/hanzi-data/[char]': ['./node_modules/hanzi-writer-data/*.json'],
  },
};

export default nextConfig;
