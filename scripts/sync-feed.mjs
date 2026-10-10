// Snapshot the live InstiApp feed into src/data/live-feed.json (+ posters into public/assets/live/).
// Usage: npm run sync:feed
//
// Source: https://gymkhana.iitb.ac.in/instiapp/api/events (the public API behind https://www.insti.app/feed;
// api.insti.app now 301-redirects there).
//
// - Type: the API has no event/competition/announcement field, so it is classified by rule (see classify()).
// - Status: the API's `verification_status` is recorded as `apiStatus`. insti.app lists pending posts publicly,
//   so every live post is shown in the student feed (matching the site).
// - Range: posts starting since SINCE (default 2026-09-01; override with SINCE=YYYY-MM-DD) + anything still running.
// - Privacy: personal mobile numbers in descriptions are replaced with "[number removed]".
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://gymkhana.iitb.ac.in/instiapp/api/events'
const OUT = path.join(ROOT, 'src/data/live-feed.json')
const POSTERS = path.join(ROOT, 'public/assets/live')

const TZ = 'Asia/Kolkata'
const DAY_MS = 86_400_000

/** registration / trials / hackathon / competition → competition; notices running > 60 days → announcement. */
function classify(e) {
  const t = `${e.name} ${e.email_subject ?? ''}`.toLowerCase()
  if (/\b(registration|register|trials?|hackathon|competition|contest|tryouts?|auditions?)\b/.test(t)) return ['competition', 'keyword in title']
  const span = (new Date(e.end_time) - new Date(e.start_time)) / DAY_MS
  if (span > 60) return ['announcement', `runs ${Math.round(span)} days`]
  return ['event', 'default']
}

const PHONE = /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/g
// Institutional emergency lines (hospital, QRT, helplines) are public safety information and are kept;
// personal mobile numbers of students / secretaries are removed.
const KEEP = /emergency|hospital|qrt|helpline/i
/** A line is institutional if it names an emergency service, or sits under a heading that does ("…Numbers:"). */
const isKept = (lines, i) => KEEP.test(lines[i]) || (i > 0 && KEEP.test(lines[i - 1]) && lines[i - 1].trim().endsWith(':'))
const redact = (s = '') => {
  const lines = s.split('\n')
  return lines
    .map((line, i) => (isKept(lines, i) ? line : line.replace(PHONE, '[number removed]')))
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

const fmt = (iso, opts) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts }).format(new Date(iso))
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "8 Oct" (+ year when asked) — fixed 3-letter months, in IST. */
const dm = (iso, withYear = false) => {
  const [d, m, y] = fmt(iso, { day: 'numeric', month: 'numeric', year: 'numeric' }).split('/')
  return `${Number(d)} ${MON[Number(m) - 1]}${withYear ? ' ' + y : ''}`
}
const dayLabel = (iso) => `${fmt(iso, { weekday: 'short' })}, ${dm(iso)}`
const timeLabel = (iso) => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).replace('am', 'AM').replace('pm', 'PM')

function dateLabel(e) {
  const start = dayLabel(e.start_time)
  const days = (new Date(e.end_time) - new Date(e.start_time)) / DAY_MS
  if (days <= 1) return start
  const sameYear = fmt(e.start_time, { year: 'numeric' }) === fmt(e.end_time, { year: 'numeric' })
  const end = dm(e.end_time, !sameYear)
  return `${start} – ${end}`
}

const deadlineOf = (e, type) =>
  type === 'competition' && /registration|register/i.test(e.name) ? `Deadline ${dm(e.end_time)}` : undefined

async function download(url, file) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()))
}

async function get(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status} ${url}`)
  return (await res.json()).data
}

// Two calls, merged by id:
//  1. `?start&end` (what insti.app's Calendar uses) — every post starting since SINCE, ended ones included;
//  2. the plain feed — posts still running that started before SINCE (e.g. year-long programmes).
const SINCE = process.env.SINCE ?? '2026-09-01'
const UNTIL = new Date(Date.now() + 180 * DAY_MS).toISOString()
const ranged = await get(`${API}?start=${new Date(`${SINCE}T00:00:00+05:30`).toISOString()}&end=${UNTIL}`)
const current = await get(API)
const data = [...new Map([...ranged, ...current].map((e) => [e.id, e])).values()]
fs.mkdirSync(POSTERS, { recursive: true })

const clubs = {}
const events = []
for (const e of data) {
  const [type, why] = classify(e)
  let poster
  if (e.image_url) {
    const file = `${e.str_id}${path.extname(new URL(e.image_url).pathname) || '.jpg'}`
    await download(e.image_url, path.join(POSTERS, file))
    poster = `/assets/live/${file}`
  }
  for (const b of e.bodies) {
    clubs[b.str_id] = { id: b.str_id, name: b.name, tagline: (b.short_description || '').trim() }
  }
  const status = ['approved', 'pending', 'rejected'].includes(e.verification_status) ? e.verification_status : 'pending'
  const description = redact(e.longdescription || e.description)
  events.push({
    id: e.str_id,
    sourceId: e.id,
    type,
    typeReason: why,
    apiStatus: status,
    rejectionComment: e.rejection_reason || undefined,
    title: e.name.trim(),
    description,
    date: dateLabel(e),
    deadline: deadlineOf(e, type),
    // Midnight starts are posting artefacts (registrations, year-long programmes), and a deadline's
    // time would otherwise show the *start* time — hide the time in both cases.
    time: e.all_day || deadlineOf(e, type) || timeLabel(e.start_time) === '12:00 AM' ? '' : timeLabel(e.start_time),
    venue: [e.venues.map((v) => v.short_name || v.name).join(', '), e.venue_room].filter(Boolean).join(' · '),
    clubs: e.bodies.map((b) => b.str_id),
    poster,
    website: e.website_url || undefined,
    interested: e.interested_count ?? 0,
    going: e.going_count ?? 0,
    weight: e.weight ?? 0,
    createdAt: Date.parse(e.time_of_creation),
    startsAt: Date.parse(e.start_time),
  })
}

const leftovers = events.flatMap((e) =>
  e.description.split('\n').filter((_, i, ls) => !isKept(ls, i)).flatMap((l) => l.match(PHONE) ?? []),
)
if (leftovers.length) throw new Error(`Unredacted numbers: ${leftovers.join(', ')}`)

// Drop posters for posts no longer in the snapshot.
const keep = new Set(events.map((e) => e.poster && path.basename(e.poster)).filter(Boolean))
for (const f of fs.readdirSync(POSTERS)) if (!keep.has(f)) fs.rmSync(path.join(POSTERS, f))

events.sort((a, b) => b.startsAt - a.startsAt)
const snapshot = { source: API, since: SINCE, fetchedAt: new Date().toISOString(), clubs, events }
fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n')
console.table(events.map((e) => ({ title: e.title.slice(0, 44), type: e.type, why: e.typeReason, api: e.apiStatus, date: e.date, poster: !!e.poster })))
console.log(`Wrote ${path.relative(ROOT, OUT)} · ${events.length} events · ${Object.keys(clubs).length} clubs`)
