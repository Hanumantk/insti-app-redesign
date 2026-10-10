import { ArrowSquareOut, Plus, Tray } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { InstiEvent, Status } from '../data/types'
import { hostName, posterFor, queueFor, typeLabel } from '../lib/events'
import { useApp } from '../store/useApp'
import { DecisionBar, EventBody, History } from './EventDetail'
import { EventMeta, Poster, StatusPill } from './ui'

type QueueFilter = Status | 'all'
const FILTERS: { f: QueueFilter; label: string }[] = [
  { f: 'pending', label: 'Pending' },
  { f: 'rejected', label: 'Rejected' },
  { f: 'approved', label: 'Approved' },
  { f: 'all', label: 'All' },
]

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))

/**
 * Master–detail review workspace (design.md § Review workspace).
 * GSec ("Event Approvals") triages every submission; GSHA ("Event status") tracks their own.
 */
export function ReviewWorkspace({ role }: { role: 'gsha' | 'gsec' }) {
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const events = useApp((s) => s.events)
  const approve = useApp((s) => s.approve)
  const showToast = useApp((s) => s.showToast)
  const queue = useMemo(() => queueFor(events, role), [events, role])

  const counts = useMemo(() => {
    const c: Record<QueueFilter, number> = { pending: 0, rejected: 0, approved: 0, all: queue.length }
    queue.forEach((e) => c[e.status]++)
    return c
  }, [queue])

  const defaultFilter: QueueFilter = role === 'gsec' && counts.pending ? 'pending' : 'all'
  const filter = (params.get('filter') as QueueFilter) || defaultFilter
  const [q, setQ] = useState('')
  const list = useMemo(
    () => queue.filter((e) => (filter === 'all' || e.status === filter) && (!q.trim() || e.title.toLowerCase().includes(q.trim().toLowerCase()))),
    [queue, filter, q],
  )

  const setParam = (patch: Record<string, string | null>) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        Object.entries(patch).forEach(([k, v]) => (v === null ? n.delete(k) : n.set(k, v)))
        return n
      },
      { replace: true },
    )

  // Selection lives in the URL; when the selected item leaves the list (e.g. approved out of
  // "Pending"), move to the item now at the same position — triage keeps flowing.
  const selectedId = params.get('id')
  const lastIndex = useRef(0)
  const selected = list.find((e) => e.id === selectedId)
  useEffect(() => {
    if (selected) {
      lastIndex.current = list.indexOf(selected)
      return
    }
    const next = list[Math.min(lastIndex.current, list.length - 1)]
    if (next && next.id !== selectedId) setParam({ id: next.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, list])

  const [rejectOpen, setRejectOpen] = useState(false)
  useEffect(() => setRejectOpen(false), [selectedId])

  const move = (d: 1 | -1) => {
    if (!list.length) return
    const i = selected ? list.indexOf(selected) : -1
    const n = list[Math.max(0, Math.min(list.length - 1, i + d))]
    setParam({ id: n.id })
    document.getElementById(`row-${n.id}`)?.scrollIntoView({ block: 'nearest' })
  }

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (isTyping(ev.target) || ev.metaKey || ev.ctrlKey || ev.altKey || document.querySelector('[role=dialog]')) return
      const k = ev.key.toLowerCase()
      if (k === 'j' || ev.key === 'ArrowDown') { ev.preventDefault(); move(1) }
      else if (k === 'k' || ev.key === 'ArrowUp') { ev.preventDefault(); move(-1) }
      else if (k === 'e' && selected) nav(`/event/${selected.id}/edit`)
      else if (role === 'gsec' && selected && k === 'a' && selected.status !== 'approved') {
        const before = approve(selected.id)
        if (before) showToast({ message: `Approved “${selected.title}”`, undo: before })
      } else if (role === 'gsec' && selected && k === 'r' && selected.status !== 'rejected') {
        ev.preventDefault()
        setRejectOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
      {/* Queue */}
      <section aria-label="Submissions" className="flex min-h-0 flex-col border-rule lg:border-r">
        <div className="grid gap-3 border-b border-rule px-gutter py-4 lg:pl-0 lg:pr-5">
          <div className="flex gap-1 rounded-pill bg-surface-2 p-1" role="group" aria-label="Filter by status">
            {FILTERS.map(({ f, label }) => (
              <button
                key={f}
                aria-pressed={filter === f}
                onClick={() => { lastIndex.current = 0; setParam({ filter: f, id: null }) }}
                className={`flex h-8 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-pill px-2 text-sm font-medium transition-colors duration-short ease-out ${
                  filter === f ? 'bg-surface text-ink shadow-[0_1px_2px_var(--color-rule-strong)]' : 'text-muted hover:text-ink'
                }`}
                data-testid={`queue-${f}`}
              >
                {label}
                <span className="tnum text-xs text-muted">{counts[f]}</span>
              </button>
            ))}
          </div>
          <label className="block">
            <span className="sr-only">Search submissions</span>
            <input className="input h-10" placeholder="Search by title…" value={q} onChange={(ev) => setQ(ev.target.value)} />
          </label>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-gutter py-2 lg:pl-0 lg:pr-3" data-testid="queue">
          {list.map((e) => (
            <QueueRow
              key={e.id}
              e={e}
              selected={e.id === selected?.id}
              onSelect={() => {
                if (window.matchMedia('(min-width: 1024px)').matches) setParam({ id: e.id })
                else nav(`/event/${e.id}`)
              }}
            />
          ))}
          {!list.length && <EmptyQueue role={role} filter={filter} searching={!!q.trim()} />}
        </ul>

        <p className="hidden border-t border-rule py-3 pr-5 text-xs text-muted lg:block">
          <Kbd>J</Kbd> <Kbd>K</Kbd> move · {role === 'gsec' && <><Kbd>A</Kbd> approve · <Kbd>R</Kbd> reject · </>}<Kbd>E</Kbd> edit
        </p>
      </section>

      {/* Detail */}
      <section aria-label="Selected submission" className="hidden min-h-0 overflow-y-auto lg:block" data-testid="review-panel">
        {selected ? (
          <article key={selected.id} className="mx-auto grid max-w-[820px] gap-8 px-10 py-8">
            <header className="grid grid-cols-[120px_minmax(0,1fr)] gap-6">
              <Poster src={posterFor(selected, 'status').src} label={hostName(selected)} className="aspect-[4/5] w-[120px] rounded-tile border border-rule text-sm" />
              <div className="min-w-0">
                <h2 className="text-xl font-bold" data-testid="panel-title">{selected.title}</h2>
                <EventMeta e={selected} size="md" className="mt-3" />
                <Link to={`/event/${selected.id}`} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent-strong underline-offset-4 hover:underline">
                  Open full page
                  <ArrowSquareOut size={14} aria-hidden />
                </Link>
              </div>
            </header>
            <DecisionBar e={selected} role={role} rejectOpen={rejectOpen} setRejectOpen={setRejectOpen} />
            <hr className="border-rule" />
            <EventBody e={selected} compact />
            <History e={selected} />
          </article>
        ) : (
          <div className="grid h-full place-items-center p-10 text-sm text-muted">Select a submission to review it.</div>
        )}
      </section>
    </div>
  )
}

function QueueRow({ e, selected, onSelect }: { e: InstiEvent; selected: boolean; onSelect: () => void }) {
  return (
    <li>
      <button
        id={`row-${e.id}`}
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
        className={`grid w-full grid-cols-[48px_minmax(0,1fr)] gap-3 rounded-tile border px-3 py-3 text-left transition-colors duration-short ease-out ${
          selected ? 'border-accent bg-accent-tint' : 'border-transparent hover:bg-surface-2'
        }`}
        data-testid="status-card"
        data-status={e.status}
      >
        <Poster src={posterFor(e, 'status').src} label={hostName(e)} small className="aspect-[4/5] w-12 rounded-[8px]" />
        <span className="min-w-0">
          <span className="line-clamp-2 text-[15px] font-medium leading-5 text-ink">{e.title}</span>
          <span className="mt-2 flex items-center gap-2">
            <StatusPill status={e.status} />
            <span className="tnum truncate text-xs text-muted">
              {typeLabel[e.type]} · {(e.deadline ?? e.date).trim()}
            </span>
          </span>
        </span>
      </button>
    </li>
  )
}

function EmptyQueue({ role, filter, searching }: { role: 'gsha' | 'gsec'; filter: QueueFilter; searching: boolean }) {
  const nav = useNavigate()
  const title = searching ? 'No submissions match that title.' : filter === 'pending' ? 'Nothing waiting for review.' : `No ${filter === 'all' ? '' : filter + ' '}submissions yet.`
  return (
    <li className="grid justify-items-start gap-3 px-3 py-10" data-testid="queue-empty">
      <Tray size={32} className="text-muted" aria-hidden />
      <p className="font-medium text-ink">{title}</p>
      <p className="text-sm text-muted">
        {role === 'gsec' ? 'New events from GSHA appear here as soon as they’re submitted.' : 'Events you create appear here with their review status.'}
      </p>
      {role === 'gsha' && !searching && (
        <button className="btn btn-primary mt-1" onClick={() => nav('/event/new')}>
          <Plus size={16} weight="bold" aria-hidden />
          New event
        </button>
      )}
    </li>
  )
}

const Kbd = ({ children }: { children: string }) => (
  <kbd className="inline-grid h-5 min-w-5 place-items-center rounded-[5px] border border-rule-strong bg-surface px-1 font-body text-[11px] font-medium text-ink-2">{children}</kbd>
)
