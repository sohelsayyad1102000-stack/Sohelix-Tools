import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  // Load routes for SSG
  let includedRoutes = [];
  try {
    const routesPath = path.resolve(__dirname, 'src/routes-list.json');
    if (fs.existsSync(routesPath)) {
      includedRoutes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not load routes-list.json, SSG might be incomplete');
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    ssr: {
      noExternal: [],
      external: ['react', 'react-dom', 'react-helmet-async', 'react-router-dom'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true'
        ? { clientPort: 443 }
        : false,
      watch: {
        ignored: ['**/.local/**', '**/.git/**', '**/node_modules/**'],
      },
    },
  };
});
