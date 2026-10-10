import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'qa',
  timeout: 60_000,
  workers: 4,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5540',
    viewport: { width: 1512, height: 982 },
    deviceScaleFactor: 1,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5540',
    reuseExistingServer: true,
  },
})
