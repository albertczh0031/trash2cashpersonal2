const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trash2cashpersonal.onrender.com",
        pathname: "/**", 
      }, // allow loading images from Django dev server
    ],
  },
};

export default nextConfig;
