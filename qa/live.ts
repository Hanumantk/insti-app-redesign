import fs from 'node:fs'

// Test fixtures read from the live snapshot, so specs keep working after `npm run sync:feed`.
type Ev = { id: string; type: string; apiStatus: string; poster?: string; title: string; clubs: string[] }
const live = JSON.parse(fs.readFileSync(new URL('../src/data/live-feed.json', import.meta.url), 'utf8')) as {
  events: Ev[]
  clubs: Record<string, { name: string }>
}

export const LIVE = {
  events: live.events,
  clubs: live.clubs,
  /** A live post with a poster (shown in the student feed). */
  withPoster: live.events.find((e) => !!e.poster) ?? live.events[0],
  /** A submission waiting in GSec's queue (restored Figma data). */
  pendingSubmission: 'sub-azeotropy',
  /** A GSHA submission rejected with a comment (restored Figma data). */
  rejectedSubmission: 'sub-pit-trading',
}
