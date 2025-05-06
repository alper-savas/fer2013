import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "localhost", 
      "127.0.0.1", 
      "placehold.co", 
      "outlier-classification-fer2013.s3.us-east-1.amazonaws.com",
      "outlier-classification-fer2013.s3.eu-north-1.amazonaws.com"
    ],
  },
};

export default nextConfig;
