import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables starting with VITE_
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  const proxyTarget = env.VITE_API_TARGET || 'http://82.112.238.249:5000';

  console.log("---------------------------------------------------");
  console.log("DEBUG: Using backend at:", proxyTarget);
  console.log("---------------------------------------------------");

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',

      proxy: {
        '/api/v1': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/api/profile': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/api/health': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/retailer': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/accounts': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },

      fs: {
        allow: ['..'],
      },
    },

    preview: {
      port: 3000,
      host: '0.0.0.0',
      // Allowed hosts in preview mode; you can just use IP
      allowedHosts: ['82.112.238.249', 'localhost', '127.0.0.1'],
    },

    plugins: [react()],

    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp'],
  };
});
