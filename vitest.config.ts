import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@argentina-sim/domain': path.resolve(__dirname, 'packages/simulation-domain/src/index.ts'),
      '@argentina-sim/infrastructure': path.resolve(__dirname, 'packages/simulation-infrastructure/src/index.ts')
    }
  },
  test: {
    environment: 'node',
    include: [
      'packages/simulation-domain/tests/**/*.test.ts',
      'packages/simulation-infrastructure/tests/**/*.test.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'packages/simulation-domain/src/**/*.ts',
        'packages/simulation-infrastructure/src/**/*.ts'
      ],
      exclude: [
        '**/index.ts',
        '**/worker/simulationWorkerEntry.ts'
      ]
    }
  }
});

