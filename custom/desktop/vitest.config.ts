import { defineConfig } from 'vitest/config'

/** Keep custom desktop tests independent from the upstream repository inventory. */
export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
  },
})
