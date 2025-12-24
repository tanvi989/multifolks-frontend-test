import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  console.log("---------------------------------------------------");
  console.log("DEBUG: VITE_API_TARGET loaded as:", env.VITE_API_TARGET);
  console.log("DEBUG: Proxy Target:", env.VITE_API_TARGET || 'https://mvp.multifolks.com');
  console.log("---------------------------------------------------");
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/v1': {
          target: env.VITE_API_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/api/profile': {
          target: env.VITE_API_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/api/health': {
          target: env.VITE_API_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/retailer': {
          target: env.VITE_API_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/accounts': {
          target: env.VITE_API_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/api/v1/payment': {
          target: env.VITE_API_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      },
      fs: {
        // Allow serving files from symlinked directories
        allow: ['..']
      }
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['mvp.multifolks.com'],   // <-- ADD THIS
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Serve image folders as static assets
    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp'],
  };
});
