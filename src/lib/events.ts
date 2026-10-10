import { CLUBS } from '../data/seed'
import type { InstiEvent, Status } from '../data/types'
import type { Filters } from '../store/useApp'

/** Items a student can see. Seeded submissions that mirror a feed item stay out of it. */
export function feedItems(events: InstiEvent[]) {
  return events.filter((e) => e.status === 'approved' && (e.placement === 'feed' || !e.feedRef))
}

/** Newest first, so an approved demo event shows at the front of its row. */
export function byType(events: InstiEvent[], type: InstiEvent['type']) {
  const items = feedItems(events).filter((e) => e.type === type)
  return [...items.filter((e) => e.placement === 'submission'), ...items.filter((e) => e.placement === 'feed')]
}

export function applyFilters(events: InstiEvent[], f: Filters) {
  return events.filter((e) => {
    if (f.days.length && !f.days.some((d) => e.date.trim().startsWith(d))) return false
    if (f.clubs.length && !f.clubs.some((c) => e.clubs.includes(c))) return false
    return true
  })
}

export const activeFilterCount = (f: Filters) => f.days.length + f.clubs.length

export const clubMatches = (clubId: string, q: string) => {
  const c = CLUBS[clubId]
  const s = q.trim().toLowerCase()
  return !s || c.name.toLowerCase().includes(s) || c.tagline.toLowerCase().includes(s)
}

/** Submissions a role reviews: GSHA sees their own, GSec sees everything submitted. */
export function queueFor(events: InstiEvent[], role: 'gsha' | 'gsec') {
  const subs = events.filter((e) => e.placement === 'submission')
  return role === 'gsha' ? subs.filter((e) => e.createdBy === 'gsha') : subs
}

export const STATUS_ORDER: Status[] = ['pending', 'rejected', 'approved']

export const posterFor = (e: InstiEvent, kind: 'card' | 'status' | 'hero' | 'detail') => {
  if (e.uploadedPoster) return { src: e.uploadedPoster, cover: true }
  const pick = {
    card: e.cardPoster ?? e.detailPoster,
    status: e.statusPoster ?? e.cardPoster ?? e.detailPoster,
    hero: e.heroPoster ?? e.cardPoster,
    detail: e.detailPoster ?? e.cardPoster ?? e.statusPoster,
  }[kind]
  // Live posters come in any aspect (square, portrait…): show them whole on the detail page.
  return { src: pick, cover: kind !== 'detail' }
}

export const dateLabel = (e: InstiEvent) => (e.deadline ?? e.date).trim()

/** "just now", "4 min ago", "Tue 14:02" — for history steps recorded during the demo. */
export function when(at?: number) {
  if (!at) return null
  const s = Math.round((Date.now() - at) / 1000)
  if (s < 45) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 6 * 86400) return new Intl.DateTimeFormat('en-IN', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(at)
  const d = new Date(at)
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]
  return `${d.getDate()} ${mon}${d.getFullYear() === new Date().getFullYear() ? '' : ` ${d.getFullYear()}`}`
}

export const typeLabel: Record<InstiEvent['type'], string> = {
  event: 'Event',
  competition: 'Competition',
  announcement: 'Announcement',
}

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
/** Weekdays the given events start on, Mon → Sun. */
export const weekdaysOf = (events: InstiEvent[]) =>
  WEEK.filter((d) => events.some((e) => e.date.trim().startsWith(d)))

/** First organising club's name — used as the poster stand-in when an event has no image. */
export const hostName = (e: InstiEvent) => CLUBS[e.clubs[0]]?.name ?? typeLabel[e.type]
