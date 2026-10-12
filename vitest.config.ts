import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    // Agent worktrees live under .claude/ and contain full copies of the repo
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
})
