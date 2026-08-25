import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': new URL('.', import.meta.url).pathname,
      'server-only': new URL('./tests/helpers/server-only-stub.ts', import.meta.url).pathname,
    },
  },
});