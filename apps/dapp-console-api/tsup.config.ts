/* eslint-disable no-console */
import { defineConfig } from 'tsup'

export default defineConfig({
  name: '@eth-optimism/dapp-console-api',
  entry: ['src/index.ts', 'src/cmd/run.ts', 'src/cmd/runProcessor.ts'],
  outDir: 'build',
  format: ['cjs'],
  target: 'node18',
  splitting: false,
  sourcemap: true,
  clean: true,
})
