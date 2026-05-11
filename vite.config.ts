import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // এই লাইনটি ইলেকট্রন অ্যাপের সাদা স্ক্রিন সমস্যা সমাধান করবে
    base: './', 
    
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // AI Studio specific HMR config
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    // বিল্ড করার সময় পাথগুলো যেন রিলেটিভ থাকে তা নিশ্চিত করা
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});
