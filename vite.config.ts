import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'framer': path.resolve(__dirname, './framer-mock.js'),
          'https://esm.sh/three@0.160.0': path.resolve(__dirname, './node_modules/three'),
        }
      }
    };
});
