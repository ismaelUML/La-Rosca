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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three-vendor';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts-vendor';
          if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
          if (id.includes('node_modules/react')) return 'react-vendor';
          if (id.includes('simulation-infrastructure/src/datasets')) return 'sim-datasets';
          return undefined;
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  }
});

