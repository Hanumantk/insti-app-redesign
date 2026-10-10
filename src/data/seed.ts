import { buildFigmaSeed, FIGMA_CLUBS } from './figma-seed'
import live from './live-feed.json'
import type { Club, InstiEvent } from './types'

/**
 * Seed = the live InstiApp feed + the Figma file's mock posts.
 *
 * Live: a snapshot of https://www.insti.app/feed taken by `npm run sync:feed` — every post starting
 * since `live.since`, plus anything still running. insti.app lists posts publicly whatever their
 * review state, so every live post is in the student feed (its API state is kept as `apiStatus`).
 * Type (event / competition / announcement) is inferred by the sync script — see `typeReason`.
 * Personal mobile numbers are redacted; institutional emergency lines are kept.
 *
 * Figma: the original mock feed, Recommended hero and the GSHA submissions behind the
 * Event status / Event Approvals screens (see figma-seed.ts).
 */

type LiveEvent = (typeof live.events)[number] & { rejectionComment?: string; deadline?: string; poster?: string; website?: string }

export const FEED_SOURCE = { url: 'https://www.insti.app/feed', api: live.source, since: live.since, fetchedAt: live.fetchedAt }

export const CLUBS: Record<string, Club> = {
  ...FIGMA_CLUBS,
  ...Object.fromEntries(Object.values(live.clubs).map((c) => [c.id, { id: c.id, name: c.name, tagline: c.tagline }])),
}

function liveEvents(): InstiEvent[] {
  return (live.events as LiveEvent[]).map((e) => ({
    id: e.id,
    origin: 'live',
    apiStatus: e.apiStatus as InstiEvent['status'],
    type: e.type as InstiEvent['type'],
    placement: 'feed',
    title: e.title,
    description: e.description,
    date: e.date,
    deadline: e.deadline,
    time: e.time,
    venue: e.venue,
    detailPoster: e.poster,
    cardPoster: e.poster,
    statusPoster: e.poster,
    heroPoster: e.poster,
    website: e.website,
    clubs: e.clubs,
    interested: e.interested,
    going: e.going,
    status: 'approved',
    createdBy: 'others',
    createdAt: e.createdAt,
  }))
}

/** Live posts first (newest start first, as synced), then the Figma posts. */
export function buildSeed(): InstiEvent[] {
  return [...liveEvents(), ...buildFigmaSeed().map((e): InstiEvent => ({ ...e, origin: 'figma' }))]
}
