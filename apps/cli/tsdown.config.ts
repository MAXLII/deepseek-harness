import { defineConfig } from 'tsdown'

/**
 * The dsh CLI ships the command-line `bin` and the desktop child-process entry.
 * The root tsdown builds only `lib/types/index.js`, so this override points at
 * both emitted entries; each entry bundles its reachable launcher modules.
 * Declarations come from `tsc -b` (dts: false), matching every package.
 */
export default defineConfig({
  entry: ['lib/types/{bin,desktop-child}.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
})
