import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations for development
  productionBrowserSourceMaps: false,

  // Optimize package imports
  transpilePackages: ['@mui/material', '@mui/icons-material'],

  // Modularize imports for better tree-shaking
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },
};

export default nextConfig;
