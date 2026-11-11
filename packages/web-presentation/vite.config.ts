import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@argentina-sim/domain': path.resolve(__dirname, '../simulation-domain/src/index.ts'),
      '@argentina-sim/infrastructure': path.resolve(__dirname, '../simulation-infrastructure/src/index.ts')
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  }
});
