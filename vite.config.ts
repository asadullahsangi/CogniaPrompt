import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables - loadEnv automatically loads .env, .env.local, .env.[mode], .env.[mode].local
    // Use 'VITE_' prefix to expose to client, or load without prefix and use define
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const envAll = loadEnv(mode, process.cwd(), ''); // Load all vars for define
    
    // Vercel provides environment variables via process.env at build time
    // Priority: Vercel env var > .env.local > .env > empty string
    const apiKey = process.env.GEMINI_API_KEY || envAll.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
    
    // Log for debugging
    console.log('🔑 Build-time API Key check:', {
      mode,
      cwd: process.cwd(),
      hasVercelEnv: !!process.env.GEMINI_API_KEY,
      hasLocalEnv: !!envAll.GEMINI_API_KEY,
      hasViteEnv: !!env.VITE_GEMINI_API_KEY,
      envKeys: Object.keys(envAll).filter(k => k.includes('GEMINI') || k.includes('API')),
      finalKeyLength: apiKey.length,
      keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'EMPTY'
    });
    
    if (!apiKey && mode === 'development') {
      console.warn('⚠️  WARNING: GEMINI_API_KEY not found! Make sure .env.local exists with VITE_GEMINI_API_KEY=your_key or GEMINI_API_KEY=your_key');
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Replace process.env.API_KEY with actual value at build time
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        // Also expose via import.meta.env (Vite standard - automatically available)
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      envPrefix: 'VITE_',
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
