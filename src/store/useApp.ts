import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildSeed } from '../data/seed'
import type { HistoryEntry, InstiEvent, Role } from '../data/types'

/** Weekday prefix of an event's date label ("Mon" … "Sun"). */
export type Day = string

export type EventDraft = Pick<
  InstiEvent,
  | 'type' | 'title' | 'description' | 'moreDetails' | 'contact' | 'regards' | 'moreRegards'
  | 'instagram' | 'website' | 'date' | 'time' | 'venue' | 'clubs' | 'uploadedPoster'
>

export interface Filters {
  days: Day[]
  clubs: string[]
  search: string
}

/** What an Undo needs to put back. */
export type Snapshot = Pick<InstiEvent, 'id' | 'status' | 'rejectionComment' | 'history'>

export interface Toast {
  id: number
  message: string
  undo?: Snapshot
}

interface AppState {
  role: Role
  events: InstiEvent[]
  reactions: Record<string, { interested?: boolean; going?: boolean }>
  filters: Filters
  toast: Toast | null
  setRole: (r: Role) => void
  toggleReaction: (id: string, kind: 'interested' | 'going') => void
  createEvent: (draft: EventDraft) => string
  updateEvent: (id: string, draft: EventDraft) => void
  approve: (id: string) => Snapshot | undefined
  reject: (id: string, comment: string) => void
  resend: (id: string) => void
  restore: (s: Snapshot) => void
  showToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: () => void
  toggleDay: (d: Day) => void
  toggleClub: (c: string) => void
  setSearch: (s: string) => void
  clearFilters: () => void
  resetDemo: () => void
}

const emptyFilters: Filters = { days: [], clubs: [], search: '' }
const step = (kind: HistoryEntry['kind'], by: HistoryEntry['by'], comment?: string): HistoryEntry => ({ kind, by, comment, at: Date.now() })
const snap = (e: InstiEvent): Snapshot => ({ id: e.id, status: e.status, rejectionComment: e.rejectionComment, history: e.history })

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const patch = (id: string, fn: (e: InstiEvent) => Partial<InstiEvent>) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...fn(e) } : e)) }))

      return {
        role: 'student',
        events: buildSeed(),
        reactions: {},
        filters: emptyFilters,
        toast: null,
        setRole: (role) => set({ role }),
        toggleReaction: (id, kind) =>
          set((s) => {
            const cur = s.reactions[id] ?? {}
            return { reactions: { ...s.reactions, [id]: { ...cur, [kind]: !cur[kind] } } }
          }),
        createEvent: (draft) => {
          const role = get().role
          const id = `ev-${Date.now().toString(36)}`
          const byGsec = role === 'gsec'
          const ev: InstiEvent = {
            ...draft,
            id,
            placement: 'submission',
            interested: 0,
            going: 0,
            // GSec posts skip review (design decision 3); GSHA posts wait for approval.
            status: byGsec ? 'approved' : 'pending',
            createdBy: byGsec ? 'gsec' : 'gsha',
            createdAt: Date.now(),
            history: [step(byGsec ? 'published' : 'submitted', byGsec ? 'gsec' : 'gsha')],
          }
          set((s) => ({ events: [ev, ...s.events] }))
          return id
        },
        updateEvent: (id, draft) => {
          const by = get().role === 'gsec' ? 'gsec' : 'gsha'
          patch(id, (e) => ({ ...draft, history: [...(e.history ?? []), step('edited', by)] }))
        },
        approve: (id) => {
          const e = get().events.find((x) => x.id === id)
          if (!e) return undefined
          const before = snap(e)
          patch(id, (x) => ({ status: 'approved', rejectionComment: undefined, history: [...(x.history ?? []), step('approved', 'gsec')] }))
          return before
        },
        reject: (id, comment) =>
          patch(id, (x) => ({ status: 'rejected', rejectionComment: comment, history: [...(x.history ?? []), step('rejected', 'gsec', comment)] })),
        resend: (id) =>
          patch(id, (x) => ({ status: 'pending', history: [...(x.history ?? []), step('resubmitted', 'gsha')] })),
        restore: (s) => patch(s.id, () => ({ status: s.status, rejectionComment: s.rejectionComment, history: s.history })),
        showToast: (t) => set({ toast: { ...t, id: Date.now() } }),
        dismissToast: () => set({ toast: null }),
        toggleDay: (d) =>
          set((s) => ({
            filters: { ...s.filters, days: s.filters.days.includes(d) ? s.filters.days.filter((x) => x !== d) : [...s.filters.days, d] },
          })),
        toggleClub: (c) =>
          set((s) => ({
            filters: { ...s.filters, clubs: s.filters.clubs.includes(c) ? s.filters.clubs.filter((x) => x !== c) : [...s.filters.clubs, c] },
          })),
        setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),
        clearFilters: () => set({ filters: emptyFilters }),
        resetDemo: () => set({ events: buildSeed(), reactions: {}, filters: emptyFilters, toast: null }),
      }
    },
    {
      name: 'insti-redesign-v3',
      partialize: (s) => ({ role: s.role, events: s.events, reactions: s.reactions }),
    },
  ),
)

export const useEvent = (id: string | undefined) => useApp((s) => s.events.find((e) => e.id === id))
