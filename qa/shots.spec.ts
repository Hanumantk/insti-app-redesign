import { test } from '@playwright/test'
import { LIVE } from './live'

// Visual review screenshots for the redesign (not a Figma diff — this version departs from Figma on purpose).
// Output: qa/shots/<name>.png
type Shot = { name: string; path: string; role: 'student' | 'gsha' | 'gsec'; w: number; h: number; full?: boolean; setup?: string }

const LAPTOP = { w: 1440, h: 900 }
const SHOTS: Shot[] = [
  { name: 'login-1440', path: '/login', role: 'student', ...LAPTOP },
  { name: 'home-student-1440', path: '/home', role: 'student', ...LAPTOP, full: true },
  { name: 'home-gsec-1440', path: '/home', role: 'gsec', ...LAPTOP, full: true },
  { name: 'approvals-gsec-1440', path: '/home?tab=approvals', role: 'gsec', ...LAPTOP },
  { name: 'approvals-gsec-all-1440', path: `/home?tab=approvals&filter=all&id=${LIVE.withPoster.id}`, role: 'gsec', ...LAPTOP },
  { name: 'approvals-gsec-reject-1440', path: '/home?tab=approvals', role: 'gsec', ...LAPTOP, setup: 'reject' },
  { name: 'status-gsha-1440', path: `/home?tab=status&id=${LIVE.rejectedSubmission}`, role: 'gsha', ...LAPTOP },
  { name: 'event-student-1440', path: `/event/${LIVE.withPoster.id}`, role: 'student', ...LAPTOP, full: true },
  { name: 'event-gsec-1440', path: `/event/${LIVE.pendingSubmission}`, role: 'gsec', ...LAPTOP },
  { name: 'form-gsha-1440', path: '/event/new', role: 'gsha', ...LAPTOP, full: true },
  { name: 'filter-1440', path: '/home?drawer=filter', role: 'student', ...LAPTOP },
  { name: 'approvals-gsec-1280', path: '/home?tab=approvals', role: 'gsec', w: 1280, h: 800 },
  { name: 'home-student-390', path: '/home', role: 'student', w: 390, h: 844, full: true },
  { name: 'event-student-390', path: `/event/${LIVE.withPoster.id}`, role: 'student', w: 390, h: 844, full: true },
]

for (const s of SHOTS) {
  test(s.name, async ({ page }) => {
    await page.setViewportSize({ width: s.w, height: s.h })
    await page.addInitScript((role) => {
      localStorage.setItem('insti-redesign-v3', JSON.stringify({ state: { role }, version: 0 }))
    }, s.role)
    await page.goto(s.path + (s.path.includes('?') ? '&' : '?') + 'demo=0')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)
    if (s.setup === 'reject') await page.getByTestId('page-reject').click()
    await page.waitForTimeout(400)
    // CSS zoom (90% on desktop) inflates Playwright's full-page size; clip to the real scroll extent.
    const size = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }))
    await page.screenshot({ path: `qa/shots/${s.name}.png`, fullPage: !!s.full, clip: s.full ? { x: 0, y: 0, ...size } : undefined })
  })
}
