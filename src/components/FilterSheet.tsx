import { Check, MagnifyingGlass } from '@phosphor-icons/react'
import { CLUBS } from '../data/seed'
import { clubMatches } from '../lib/events'
import { useApp, type Day } from '../store/useApp'
import { Sheet } from './Sheet'
import { ClubMark } from './ui'



/**
 * 143:874 rebuilt as a sheet. Day chips and clubs filter the Events row.
 * The Figma file drew eight identical "Pixels" tiles; this lists each club once.
 * The Date/Month and time fields are dropped — no event data backs them.
 * Day chips are the weekdays events in the feed start on (live data, so they change with each sync).
 */
export function FilterSheet({ onClose, resultCount, days }: { onClose: () => void; resultCount: number; days: Day[] }) {
  const f = useApp((s) => s.filters)
  const toggleDay = useApp((s) => s.toggleDay)
  const toggleClub = useApp((s) => s.toggleClub)
  const setSearch = useApp((s) => s.setSearch)
  const clear = useApp((s) => s.clearFilters)
  const clubs = Object.keys(CLUBS).filter((c) => clubMatches(c, f.search))
  const active = f.days.length + f.clubs.length

  return (
    <Sheet
      title="Filter by"
      onClose={onClose}
      testId="filter-panel"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button className="btn btn-ghost" onClick={clear} disabled={!active} data-testid="filter-clear">Clear all</button>
          <button className="btn btn-primary" onClick={onClose} data-testid="filter-apply">
            Show {resultCount} {resultCount === 1 ? 'event' : 'events'}
          </button>
        </div>
      }
    >
      <div className="grid gap-8 px-6 py-6">
        <fieldset>
          <legend className="field-label">Day</legend>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => {
              const on = f.days.includes(d)
              return (
                <button
                  key={d}
                  aria-pressed={on}
                  onClick={() => toggleDay(d)}
                  className={`btn h-9 px-4 ${on ? 'border-accent bg-accent-tint text-accent-strong' : 'btn-secondary'}`}
                  data-testid={`day-${d}`}
                >
                  {on && <Check size={14} weight="bold" aria-hidden />}
                  {d}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="field-label">Clubs</legend>
          <label className="relative block">
            <span className="sr-only">Search clubs</span>
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              className="input pl-10"
              placeholder="Search clubs…"
              value={f.search}
              onChange={(ev) => setSearch(ev.target.value)}
              data-autofocus
            />
          </label>
          <ul className="mt-3 grid gap-1">
            {clubs.map((id) => {
              const c = CLUBS[id]
              const on = f.clubs.includes(id)
              return (
                <li key={id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-tile px-2 py-2 hover:bg-surface-2" data-testid="club-tile">
                    <input type="checkbox" checked={on} onChange={() => toggleClub(id)} className="size-4 accent-[var(--color-accent)]" />
                    <ClubMark name={c.name} logo={c.logo} size={36} />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium text-ink">{c.name.trim()}</span>
                      <span className="block truncate text-sm text-muted">{c.tagline}</span>
                    </span>
                  </label>
                </li>
              )
            })}
            {!clubs.length && <li className="px-2 py-4 text-sm text-muted">No clubs match “{f.search}”.</li>}
          </ul>
        </fieldset>
      </div>
    </Sheet>
  )
}
