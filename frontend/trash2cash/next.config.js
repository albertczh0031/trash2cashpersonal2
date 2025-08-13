const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      }, // allow loading images from Django dev server
    ],
  },
};

export default nextConfig;
