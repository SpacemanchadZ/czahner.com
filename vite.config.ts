import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Multi-page build: every HTML entry below becomes its own page on GitHub Pages.
const pages = {
  home: 'index.html',
  lab: 'lab/index.html',
  maintlytics: 'lab/maintlytics/index.html',
  jobPlanBuilder: 'lab/job-plan-builder/index.html',
  notFound: '404.html',
};

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([name, file]) => [name, resolve(__dirname, file)]),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
