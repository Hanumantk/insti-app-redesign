import { CaretLeft, CaretRight, Funnel } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { InstiEvent } from '../data/types'
import { hostName, posterFor } from '../lib/events'
import { useApp } from '../store/useApp'
import { EventMeta, Poster } from './ui'

/** Feed card — 280px wide (5 per row at 1512), poster on Figma's own 415:391 crop. */
export function EventCard({ e }: { e: InstiEvent }) {
  const p = posterFor(e, 'card')
  return (
    <Link
      to={`/event/${e.id}`}
      className="card-hover group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-card border border-rule bg-surface"
      data-testid="event-card"
    >
      <Poster src={p.src} label={hostName(e)} className="aspect-[415/391] w-full border-b border-rule" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-md font-medium leading-6">{e.title}</h3>
        <EventMeta e={e} className="mt-auto" />
      </div>
    </Link>
  )
}

/** Recommended feature (75:363), two-column and content-height. */
export function RecommendedHero({ e }: { e: InstiEvent }) {
  const mine = useApp((s) => s.reactions[e.id])
  const toggle = useApp((s) => s.toggleReaction)
  const p = posterFor(e, 'hero')
  return (
    <article className={`grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-panel border border-rule bg-surface ${p.src ? 'md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]' : ''}`}>
      {/* The poster fills its column; the text column sets the card's height. No poster → text only. */}
      {p.src && (
        <Link to={`/event/${e.id}`} className="relative block aspect-[16/9] border-b border-rule md:aspect-auto md:border-b-0 md:border-r" aria-label={e.title}>
          <Poster src={p.src} className="absolute inset-0 size-full" />
        </Link>
      )}
      <div className="flex min-w-0 flex-col gap-4 p-6 md:p-8">
        <h2 className="text-xl font-bold">
          <Link to={`/event/${e.id}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">{e.title}</Link>
        </h2>
        <p className="line-clamp-4 max-w-[64ch] text-ink-2">{e.heroBlurb ?? e.description}</p>
        <EventMeta e={e} size="md" />
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button className={`btn ${mine?.interested ? 'border-accent bg-accent-tint text-accent-strong' : 'btn-secondary'}`} aria-pressed={!!mine?.interested} onClick={() => toggle(e.id, 'interested')}>
            Interested
          </button>
          <button className={`btn ${mine?.going ? 'border-accent bg-accent-tint text-accent-strong' : 'btn-secondary'}`} aria-pressed={!!mine?.going} onClick={() => toggle(e.id, 'going')}>
            Going
          </button>
        </div>
      </div>
    </article>
  )
}

/** A titled row of cards: arrows + scroll-snap, visible thin scrollbar. */
export function CardRow({
  title, items, testId, filterCount, onFilter, empty,
}: { title: string; items: InstiEvent[]; testId: string; filterCount?: number; onFilter?: () => void; empty?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })
  const update = () => {
    const el = ref.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 })
  }
  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [items.length])
  const page = (d: 1 | -1) => ref.current?.scrollBy({ left: d * (ref.current.clientWidth - 120), behavior: 'smooth' })

  return (
    <section aria-label={title}>
      <div className="flex items-center gap-2">
        <h2 className="mr-auto text-xl font-bold">{title}</h2>
        {onFilter && (
          <button className="btn btn-secondary" onClick={onFilter} data-testid="filter-by">
            <Funnel size={16} aria-hidden />
            Filter by
            {!!filterCount && <span className="tnum grid size-5 place-items-center rounded-pill bg-accent text-xs text-accent-ink">{filterCount}</span>}
          </button>
        )}
        <button className="icon-btn border border-rule-strong bg-surface" aria-label={`Previous ${title.toLowerCase()}`} onClick={() => page(-1)} disabled={edge.start}>
          <CaretLeft size={18} />
        </button>
        <button className="icon-btn border border-rule-strong bg-surface" aria-label={`Next ${title.toLowerCase()}`} onClick={() => page(1)} disabled={edge.end}>
          <CaretRight size={18} />
        </button>
      </div>
      <div
        ref={ref}
        onScroll={update}
        className="scroll-row -mx-gutter mt-4 flex [contain:paint] snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-4"
        data-testid={testId}
      >
        {items.map((e) => <EventCard key={e.id} e={e} />)}
        {!items.length && (empty ?? <p className="py-8 text-sm text-muted">Nothing here yet.</p>)}
      </div>
    </section>
  )
}
