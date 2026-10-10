export type Role = 'student' | 'gsha' | 'gsec'
export type EventType = 'event' | 'competition' | 'announcement'
export type Status = 'pending' | 'approved' | 'rejected'

/**
 * Where a record lives:
 * - feed: seeded items that make up the Student home exactly as in Figma 75:358
 * - submission: something a creator sent for approval (the 41:211 / 49:184 grids)
 */
export type Placement = 'feed' | 'submission'

export interface InstiEvent {
  id: string
  type: EventType
  placement: Placement
  /** A seeded submission that mirrors a feed item never enters the feed itself. */
  feedRef?: string
  recommended?: boolean
  title: string
  org?: string
  /** Long description shown on the event page next to the poster. */
  description: string
  /** Text shown on cards before the "more..." link (verbatim from Figma). */
  cardBlurb?: string
  /** Longer blurb used by the Recommended hero card. */
  heroBlurb?: string
  /** "More details" body. Blank lines are kept; **x** renders Helvetica Neue Medium. */
  moreDetails?: string
  contact?: string
  regards?: string
  moreRegards?: string
  instagram?: string
  website?: string
  /** e.g. "Wed, 21 Jan " (Figma keeps a trailing space) */
  date: string
  time: string
  /** Competitions show "Deadline 22 Jan" in place of the date. */
  deadline?: string
  venue: string
  /** Image used in the 415x391 feed card (pre-cropped by Figma's Union mask). */
  cardPoster?: string
  /** Image used in the 302x392 status/approval card. */
  statusPoster?: string
  /** Image used in the 520x352 hero frame. */
  heroPoster?: string
  /** Full poster for the 549x777 event page frame. */
  detailPoster?: string
  /** Uploaded posters (data URL) are used everywhere with object-fit: cover. */
  uploadedPoster?: string
  clubs: string[]
  interested: number
  going: number
  status: Status
  rejectionComment?: string
  createdBy: 'others' | 'gsha' | 'gsec'
  createdAt: number
  history?: HistoryEntry[]
  /** Where the post came from: the live insti.app snapshot, the Figma mock, or created in the demo. */
  origin?: 'live' | 'figma'
  /** insti.app's own review state for live posts (informational — insti.app lists them all). */
  apiStatus?: Status
}

export interface Club {
  id: string
  name: string
  tagline: string
  logo?: string
}

/** One step in a submission's review trail. Seeded steps carry no timestamp (Figma has none). */
export interface HistoryEntry {
  kind: 'submitted' | 'approved' | 'rejected' | 'resubmitted' | 'edited' | 'published'
  by: 'gsha' | 'gsec'
  at?: number
  comment?: string
}
