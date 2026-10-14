import { expect, test, type Page } from '@playwright/test'
import { LIVE } from './live'

// The live demo script, end to end on the redesigned UI — and again after a reload.
const TITLE = 'Demo Night: Insti Open Mic'
const COMMENT = 'Please add the venue booking confirmation.'

const asRole = (page: Page, role: 'student' | 'gsha' | 'gsec') => page.getByTestId(`role-${role}`).click()
const row = (page: Page) => page.getByTestId('status-card').filter({ hasText: TITLE })

test.use({ viewport: { width: 1440, height: 900 } })

test('create → reject → edit → resend → approve (with Undo) → student feed', async ({ page }) => {
  page.on('dialog', (d) => d.accept())
  await page.goto('/login')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  // Log in as GSHA through the loading screen
  await asRole(page, 'gsha')
  await page.getByTestId('login-sso').click()
  await expect(page).toHaveURL(/\/loading/)
  await expect(page).toHaveURL(/\/home$/, { timeout: 3000 })

  // GSHA creates an event — required fields are validated first
  await page.getByTestId('fab-add').click()
  await page.getByTestId('f-submit').click()
  await expect(page.getByText('Add a title — it’s what students see first.')).toBeVisible()
  await page.getByTestId('f-type-event').click()
  await page.getByTestId('f-title').fill(TITLE)
  await page.getByTestId('f-description').fill('An evening of music and poetry on the SAC lawns.')
  await page.getByTestId('f-date').fill('Sat, 24 Jan')
  await page.getByTestId('f-time').fill('7:00 PM')
  await page.getByTestId('f-venue').fill('SAC Lawns')
  await page.getByTestId('add-club').first().click()
  await page.getByTestId('f-submit').click()
  await expect(page).toHaveURL(/tab=status/)
  await expect(row(page)).toHaveAttribute('data-status', 'pending')
  await expect(page.getByTestId('panel-title')).toHaveText(TITLE)

  // Student can't see it yet
  await asRole(page, 'student')
  await expect(page.getByTestId('events-row')).not.toContainText(TITLE)

  // GSec rejects it inline from the Pending queue
  await asRole(page, 'gsec')
  await page.getByTestId('tab-approvals').click()
  await row(page).click()
  await page.getByTestId('page-reject').click()
  await page.getByTestId('reject-send').click()
  await expect(page.getByText('Add a reason so the creator knows what to change.')).toBeVisible()
  await page.getByTestId('reject-text').fill(COMMENT)
  await page.getByTestId('reject-send').click()
  await expect(row(page)).toHaveCount(0) // left the Pending queue
  await page.getByTestId('queue-rejected').click()
  await expect(row(page)).toHaveAttribute('data-status', 'rejected')

  // GSHA sees the comment without hovering, edits, then resends from the event page
  await asRole(page, 'gsha')
  await page.getByTestId('tab-status').click()
  await row(page).click()
  await expect(page.getByTestId('rejection-reason')).toContainText(COMMENT)
  await page.getByTestId('page-edit').click()
  await expect(page).toHaveURL(/\/edit$/)
  await page.getByTestId('f-venue').fill('SAC Lawns (booking confirmed)')
  await page.getByTestId('f-submit').click()
  await expect(page.getByTestId('page-status')).toContainText('Rejected')
  await expect(page.getByTestId('rejection-reason')).toContainText(COMMENT)
  await page.getByTestId('resend').click()
  await expect(page.getByTestId('page-status')).toContainText('Pending')
  await expect(page.getByTestId('history')).toContainText('Resent for approval by GSHA')

  // Survives a refresh
  await page.reload()
  await expect(page.getByTestId('page-status')).toContainText('Pending')

  // GSec approves from the event page → back to the queue with an Undo toast
  await asRole(page, 'gsec')
  await page.getByTestId('page-approve').click()
  await expect(page).toHaveURL(/tab=approvals/)
  await expect(page.getByTestId('toast')).toContainText(TITLE)
  await page.getByTestId('toast-undo').click()
  await expect(row(page)).toHaveAttribute('data-status', 'pending')

  // …and approves again with the keyboard
  await row(page).click()
  await page.keyboard.press('a')
  await expect(row(page)).toHaveCount(0)
  await page.getByTestId('queue-approved').click()
  await expect(row(page)).toHaveAttribute('data-status', 'approved')

  // Student sees it first in Events; Interested counts and persists
  await asRole(page, 'student')
  await expect(page).toHaveURL(/\/home$/)
  const first = page.getByTestId('events-row').getByTestId('event-card').first()
  await expect(first).toContainText(TITLE)
  await first.click()
  await page.getByTestId('interested').click()
  await expect(page.getByTestId('interested-count')).toHaveText('1')
  await page.reload()
  await expect(page.getByTestId('interested-count')).toHaveText('1')
})

test('feed = live insti.app posts + restored Figma posts; filters; sheets close', async ({ page }) => {
  await page.goto('/home')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  const events = page.getByTestId('events-row').getByTestId('event-card')
  const comps = page.getByTestId('competitions-row').getByTestId('event-card')

  // Every live post of each type is listed, followed by the four restored Figma posts per row.
  const liveCount = (type: string) => LIVE.events.filter((e) => e.type === type).length
  await expect(events).toHaveCount(liveCount('event') + 4)
  await expect(comps).toHaveCount(liveCount('competition') + 4)
  await expect(page.getByTestId('events-row')).toContainText('Literarium All Team Meet')
  await expect(page.getByTestId('competitions-row')).toContainText('AI-ML GC 2025-26 | Web and Coding Club')
  await expect(events.first()).toContainText(LIVE.events.find((e) => e.type === 'event')!.title)
  // Called-out cards: accent border with a label on the top edge.
  await expect(page.getByTestId('events-row').getByTestId('card-callout').filter({ hasText: 'Psychological First Aid 4 Module Course' })).toContainText('Today')
  await expect(page.getByTestId('competitions-row').getByTestId('card-callout').filter({ hasText: 'Inter IIT Pre-Camp Trials' })).toContainText('Deadline today')

  // Day chips come from the data; pick the first one and check the count it promises.
  await page.getByTestId('filter-by').click()
  await page.locator('[data-testid^=day-]').first().click()
  const n = Number((await page.getByTestId('filter-apply').textContent())!.match(/\d+/)![0])
  await page.getByTestId('filter-apply').click()
  await expect(events).toHaveCount(n)

  // A restored Figma club still filters: Pixels → Peer Connect.
  await page.getByTestId('filter-by').click()
  await page.getByTestId('filter-clear').click()
  await page.getByTestId('club-tile').filter({ hasText: 'Pixels' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('filter-panel')).toHaveCount(0)
  await expect(events).toHaveCount(1)
  await expect(events.first()).toContainText('Peer Connect: A Listening Listening Circle for PhD')

  // Competitions have their own filter; the Events filter above is left alone.
  await page.getByTestId('filter-by-competitions').click()
  await page.getByTestId('club-tile').filter({ hasText: 'Pixels' }).click()
  const m = Number((await page.getByTestId('filter-apply').textContent())!.match(/\d+/)![0])
  await page.getByTestId('filter-apply').click()
  await expect(comps).toHaveCount(m)
  await expect(events).toHaveCount(1)
  await page.getByTestId('filter-by-competitions').click()
  await page.getByTestId('filter-clear').click()
  await page.getByTestId('filter-apply').click()
  await expect(comps).toHaveCount(liveCount('competition') + 4)

  // Announcements slide in the hero slot: live notices + the four Figma ones.
  const carousel = page.getByTestId('announcements-carousel')
  const slides = carousel.getByTestId('announcement-slide')
  const total = liveCount('announcement') + 4
  await expect(slides).toHaveCount(total)
  await expect(carousel.getByRole('heading', { name: 'Announcements' })).toBeVisible()
  await carousel.hover() // holds the progress bar so the slide doesn't advance mid-test
  await carousel.getByRole('button', { name: 'Show announcement 1', exact: true }).click()
  await expect(page.getByTestId('announcements-count')).toHaveText(`1 / ${total}`)
  await page.getByTestId('announcements-next').click()
  await expect(page.getByTestId('announcements-count')).toHaveText(`2 / ${total}`)
  await expect(slides.nth(1)).not.toHaveAttribute('aria-hidden', 'true')
  await page.getByTestId('announcements-prev').click()
  await page.getByTestId('announcements-prev').click()
  await expect(page.getByTestId('announcements-count')).toHaveText(`${total} / ${total}`)
  await expect(slides.last()).toContainText('Surbahaar auditions')
  // Once the pointer leaves, the progress pill fills (6s) and moves to the next slide.
  await page.mouse.move(0, 0)
  await expect(page.getByTestId('announcements-count')).toHaveText(`1 / ${total}`, { timeout: 8000 })
})

test('review queue: J/K move, R opens the reason field, Esc cancels', async ({ page }) => {
  await page.goto('/home')
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('insti-redesign-v3', JSON.stringify({ state: { role: 'gsec' }, version: 0 })) })
  await page.goto('/home?tab=approvals&filter=all')
  const title = page.getByTestId('panel-title')
  const t0 = await title.textContent()
  await page.keyboard.press('j')
  await expect(title).not.toHaveText(t0!)
  await page.keyboard.press('k')
  await expect(title).toHaveText(t0!)
  await page.getByTestId('queue-pending').click()
  await page.keyboard.press('r')
  await expect(page.getByTestId('reject-text')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('reject-modal')).toHaveCount(0)
})

for (const w of [320, 390, 768]) {
  test(`no horizontal overflow at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 844 })
    const routes: [string, string][] = [
      ['student', '/home'], ['student', `/event/${LIVE.withPoster.id}`], ['student', '/login'],
      ['gsec', '/home?tab=approvals'], ['gsha', '/home?tab=status'], ['gsha', '/event/new'], ['gsec', `/event/${LIVE.pendingSubmission}`],
    ]
    for (const [role, path] of routes) {
      await page.goto('/login')
      await page.evaluate((r) => localStorage.setItem('insti-redesign-v3', JSON.stringify({ state: { role: r }, version: 0 })), role)
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const sw = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(sw, `${path} as ${role}`).toBeLessThanOrEqual(w)
    }
  })
}
