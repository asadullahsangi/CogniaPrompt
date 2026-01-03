import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Vercel provides environment variables via process.env at build time
    // Priority: Vercel env var > .env file > empty string
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    
    // Log for debugging (only in non-production or if key is missing)
    if (!apiKey && mode !== 'production') {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
