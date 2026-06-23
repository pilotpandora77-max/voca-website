/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: 'https://temuujin77-voca.expo.app/:path*',
      },
    ];
  },
};

export default nextConfig;
