/* eslint-env node */

import {chrome} from '../../.electron-vendors.cache.json';
import vue from '@vitejs/plugin-vue';
import {renderer} from 'unplugin-auto-expose';
import {join} from 'node:path';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');


// Pareil pour Électron ou non, parce qu'ici il s'agit de la partie interface (rendu)
const dépendsÀExclure = ['chokidar', '@libp2p/tcp', '@libp2p/mdns', 'env-paths'];

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  base: '', // pourÉlectron ? '' : '/iug/', // Plus nécessaire maintenant qu'on est sur appli.réseau-constellation.ca/
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: join(PACKAGE_ROOT, 'index.html'),
      external: dépendsÀExclure,
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    exclude: dépendsÀExclure,
    esbuildOptions: {
      target: 'esnext',
    },
  },
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'istanbul',
    },
  },
  plugins: [
    vue(),
    renderer.vite({
      preloadEntry: join(PACKAGE_ROOT, '../preload/src/index.ts'),
    }),
  ],
};

export default config;
