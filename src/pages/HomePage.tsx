import { Plus } from '@phosphor-icons/react'
import { useCallback, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnnouncementsCarousel, CardRow } from '../components/Browse'
import { FilterSheet } from '../components/FilterSheet'
import { Footer } from '../components/Footer'
import { ReviewWorkspace } from '../components/ReviewWorkspace'
import { TopBar } from '../components/TopBar'
import { CountBadge, Page } from '../components/ui'
import type { Role } from '../data/types'
import { activeFilterCount, applyFilters, byType, feedItems, queueFor, weekdaysOf } from '../lib/events'
import { useApp } from '../store/useApp'

type Tab = 'recommended' | 'status' | 'approvals'

export function HomePage() {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const role = useApp((s) => s.role)
  const events = useApp((s) => s.events)
  const filters = useApp((s) => s.filters)

  const requested = (params.get('tab') ?? 'recommended') as Tab
  const tab: Tab = (requested === 'status' && role === 'gsha') || (requested === 'approvals' && role === 'gsec') ? requested : 'recommended'
  const drawer = params.get('drawer')
  const closeDrawer = useCallback(
    () => setParams((p) => { const n = new URLSearchParams(p); n.delete('drawer'); return n }),
    [setParams],
  )
  const openDrawer = (d: string) => setParams((p) => { const n = new URLSearchParams(p); n.set('drawer', d); return n })

  const announcements = useMemo(() => feedItems(events).filter((e) => e.type === 'announcement'), [events])
  const pendingForGsec = useMemo(() => queueFor(events, 'gsec').filter((e) => e.status === 'pending').length, [events])
  const rejectedForGsha = useMemo(() => queueFor(events, 'gsha').filter((e) => e.status === 'rejected').length, [events])
  const allEvents = byType(events, 'event')
  const evs = applyFilters(allEvents, filters)
  const comps = byType(events, 'competition')
  const reviewing = tab !== 'recommended'
  const waitingByType = useMemo(() => {
    const w = { event: 0, competition: 0, announcement: 0 }
    queueFor(events, 'gsec').forEach((e) => e.status === 'pending' && w[e.type]++)
    return w
  }, [events])

  const header = (
    <Page className="flex flex-wrap items-end gap-x-6 gap-y-3 pt-5">
      <Tabs role={role} active={tab} pending={pendingForGsec} rejected={rejectedForGsha} />
      {role !== 'student' && (
        <button className="btn btn-primary mb-2 ml-auto" onClick={() => nav('/event/new')} data-testid="fab-add">
          <Plus size={16} weight="bold" aria-hidden />
          New event
        </button>
      )}
    </Page>
  )

  return (
    <>
      <TopBar />
      {reviewing ? (
        <main className="flex h-[calc(100dvh-var(--topbar-h))] flex-col">
          {header}
          <div className="mx-auto flex min-h-0 w-full max-w-page flex-1 flex-col lg:px-gutter">
            <ReviewWorkspace role={tab === 'status' ? 'gsha' : 'gsec'} />
          </div>
        </main>
      ) : (
        <>
          <main>
            {header}
            <Page className="grid grid-cols-[minmax(0,1fr)] gap-12 pt-6">
              <AnnouncementsCarousel items={announcements} />
              <CardRow
                title="Events"
                items={evs}
                testId="events-row"
                filterCount={activeFilterCount(filters)}
                onFilter={() => openDrawer('filter')}
                empty={
                  activeFilterCount(filters) ? (
                    <p className="py-8 text-sm text-muted">No events match these filters. <button className="font-medium text-accent-strong underline underline-offset-4" onClick={() => useApp.getState().clearFilters()}>Clear filters</button></p>
                  ) : (
                    <EmptyRow kind="event" role={role} waiting={waitingByType.event} />
                  )
                }
              />
              <CardRow title="Competitions" items={comps} testId="competitions-row" empty={<EmptyRow kind="competition" role={role} waiting={waitingByType.competition} />} />
            </Page>
          </main>
          <Footer />
        </>
      )}

      {drawer === 'filter' && <FilterSheet onClose={closeDrawer} resultCount={evs.length} days={weekdaysOf(allEvents)} />}
    </>
  )
}

function Tabs({ role, active, pending, rejected }: { role: Role; active: Tab; pending: number; rejected: number }) {
  const tabs: { t: Tab; label: string; to: string; badge?: { n: number; label: string } }[] = [{ t: 'recommended', label: 'Recommended', to: '/home' }]
  if (role === 'gsha') tabs.push({ t: 'status', label: 'Event status', to: '/home?tab=status', badge: { n: rejected, label: `${rejected} rejected` } })
  if (role === 'gsec') tabs.push({ t: 'approvals', label: 'Event Approvals', to: '/home?tab=approvals', badge: { n: pending, label: `${pending} pending` } })
  return (
    <nav aria-label="Home sections" className="flex gap-6">
      {tabs.map(({ t, label, to, badge }) => (
        <Link
          key={t}
          to={to}
          aria-current={active === t ? 'page' : undefined}
          className={`flex items-center gap-2 whitespace-nowrap border-b-2 pb-3 pt-2 text-[17px] font-medium transition-colors duration-short ease-out ${
            active === t ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
          }`}
          data-testid={`tab-${t}`}
        >
          {label}
          {badge && <CountBadge n={badge.n} label={badge.label} />}
        </Link>
      ))}
    </nav>
  )
}

/** Empty feed row. Students get a plain line; reviewers get a path to what's waiting. */
function EmptyRow({ kind, role, waiting }: { kind: 'event' | 'competition'; role: Role; waiting: number }) {
  const noun = kind === 'event' ? 'events' : 'competitions'
  return (
    <div className="grid w-full justify-items-start gap-2 rounded-card border border-dashed border-rule-strong px-6 py-8" data-testid={`${kind}-empty`}>
      <p className="font-medium text-ink">No {noun} are live right now.</p>
      {role === 'gsec' && waiting > 0 ? (
        <Link to="/home?tab=approvals&filter=pending" className="text-sm font-medium text-accent-strong underline underline-offset-4">
          {waiting} {waiting === 1 ? kind : noun} waiting for your review
        </Link>
      ) : (
        <p className="text-sm text-muted">New {noun} appear here once GSec approves them.</p>
      )}
    </div>
  )
}
