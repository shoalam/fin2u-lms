import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    unoptimized: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/.git/**', '**/.git', '**/node_modules/**'],
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/member-courses',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/start',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/mentorship-application-new',
        destination: '/mentorship-application',
        permanent: true,
      },
      {
        source: '/company-incorporation-in-malaysia-2',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/courses/:course/lessons/:lesson',
        destination: '/learn/:course',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
