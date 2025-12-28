import type { NextConfig } from "next";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  output: 'export',
  env: {
    NEXT_PUBLIC_USE_MOCK_DATA: 'true',
  },
  webpack: (config, { isServer }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_USE_MOCK_DATA': JSON.stringify(process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'false'),
      })
    );
    return config;
  },
};
