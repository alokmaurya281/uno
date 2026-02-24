import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  const apiUrl = env.VITE_API_URL || 'http://localhost:3001';
  const port = parseInt(env.VITE_PORT) || 5173;

  return {
    plugins: [react(), tailwindcss()],
    envDir: path.resolve(__dirname, '..'),
    server: {
      port,
      proxy: {
        '/api': apiUrl,
        '/socket.io': {
          target: apiUrl,
          ws: true,
        },
      },
    },
  };
});
