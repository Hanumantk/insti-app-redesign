import { CaretLeft, CaretRight, Funnel, Megaphone } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { InstiEvent } from '../data/types'
import { CARD_CALLOUT, hostName, posterFor } from '../lib/events'
import { EventMeta, Poster } from './ui'

/** Feed card — 280px wide (5 per row at 1512), poster on Figma's own 415:391 crop. */
export function EventCard({ e }: { e: InstiEvent }) {
  const p = posterFor(e, 'card')
  const callout = CARD_CALLOUT[e.id]
  const card = (
    <Link
      to={`/event/${e.id}`}
      className={`card-hover group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-card border ${
        callout ? 'border-accent bg-accent ring-[3px] ring-accent' : 'border-rule bg-surface'
      }`}
      data-testid="event-card"
    >
      <Poster src={p.src} label={hostName(e)} className={`aspect-[415/391] w-full border-b ${callout ? 'border-accent' : 'border-rule'}`} />
      <div className={`flex flex-1 flex-col gap-3 p-4 ${callout ? 'on-accent' : ''}`}>
        <h3 className="line-clamp-2 text-md font-medium leading-6">{e.title}</h3>
        <EventMeta e={e} className="mt-auto" />
      </div>
    </Link>
  )
  if (!callout) return card
  // The label sits on the card's top border, so it lives outside the card's overflow clip.
  return (
    <div className="relative flex shrink-0 snap-start" data-testid="card-callout">
      <span className="absolute -top-3 left-4 z-10 inline-flex h-6 items-center whitespace-nowrap rounded-pill bg-accent px-3 text-xs font-medium text-accent-ink">
        {callout}
      </span>
      {card}
    </div>
  )
}

/** Announcements carousel — takes the old Recommended hero's slot (75:363), one notice per slide. */
export function AnnouncementsCarousel({ items }: { items: InstiEvent[] }) {
  const [index, setIndex] = useState(0)
  const [held, setHeld] = useState(false) // hover or keyboard focus inside
  const reduced = useReducedMotion()
  const touchX = useRef<number | null>(null)
  const n = items.length
  const at = n ? index % n : 0
  const go = (i: number) => setIndex((i + n) % n)

  if (!n) return null
  const auto = n > 1 && !reduced
  const stepBtn = (d: 1 | -1, testId?: string) => (
    <button className="icon-btn border border-rule-strong bg-surface" aria-label={d < 0 ? 'Previous announcement' : 'Next announcement'} onClick={() => go(at + d)} data-testid={testId}>
      {d < 0 ? <CaretLeft size={18} /> : <CaretRight size={18} />}
    </button>
  )
  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby="announcements-heading"
      data-testid="announcements-carousel"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(ev) => !ev.currentTarget.contains(ev.relatedTarget) && setHeld(false)}
    >
      <div className="flex items-center gap-2">
        <h2 id="announcements-heading" className="mr-auto flex items-center gap-2 text-xl font-bold">
          <Megaphone size={24} className="text-accent" aria-hidden />
          Announcements
        </h2>
        {n > 1 && (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="tnum mr-1 text-sm text-muted" data-testid="announcements-count">{at + 1} / {n}</span>
            {stepBtn(-1, 'announcements-prev')}
            {stepBtn(1, 'announcements-next')}
          </div>
        )}
      </div>
      <div
        className="mt-4 overflow-hidden rounded-panel border border-rule bg-surface"
        onTouchStart={(ev) => (touchX.current = ev.touches[0].clientX)}
        onTouchEnd={(ev) => {
          const dx = ev.changedTouches[0].clientX - (touchX.current ?? ev.changedTouches[0].clientX)
          touchX.current = null
          if (n > 1 && Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1))
        }}
      >
        {/* Slides share the tallest one's height, so the page never jumps as they change. */}
        <div className="flex transition-transform duration-slide ease-out" style={{ transform: `translateX(-${at * 100}%)` }} aria-live={auto ? 'off' : 'polite'}>
          {items.map((e, i) => (
            <AnnouncementSlide key={e.id} e={e} label={`${i + 1} of ${n}`} hidden={i !== at} />
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1">
          {/* Below sm the header is too narrow for the controls; they sit around the dots instead. */}
          <span className="mr-auto sm:hidden">{stepBtn(-1)}</span>
          {items.map((e, i) => (
            <button
              key={e.id}
              className="group grid h-6 place-items-center px-1"
              aria-label={`Show announcement ${i + 1}`}
              aria-current={i === at ? 'true' : undefined}
              onClick={() => go(i)}
            >
              <span className={`relative block h-1.5 overflow-hidden rounded-pill transition-[width,background-color] duration-short ease-out ${i === at ? 'w-10 bg-rule-strong' : 'w-1.5 bg-rule-strong group-hover:bg-muted'}`}>
                {/* The active pill fills over AUTO_MS; finishing the fill is what advances the slide,
                    so hover/focus pausing the fill pauses the carousel too. */}
                {i === at && (
                  <span
                    key={at}
                    className="absolute inset-0 origin-left rounded-pill bg-accent"
                    style={auto ? { animation: `progress ${AUTO_MS}ms linear forwards`, animationPlayState: held ? 'paused' : 'running' } : undefined}
                    onAnimationEnd={() => go(at + 1)}
                    data-testid="announcements-progress"
                  />
                )}
              </span>
            </button>
          ))}
          <span className="ml-auto sm:hidden">{stepBtn(1)}</span>
        </div>
      )}
    </section>
  )
}

const AUTO_MS = 6000

function AnnouncementSlide({ e, label, hidden }: { e: InstiEvent; label: string; hidden: boolean }) {
  const p = posterFor(e, 'detail')
  return (
    <article
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={hidden || undefined}
      // `inert` keeps off-screen slides out of the tab order (React 18 has no typed prop for it).
      {...(hidden ? { inert: '' } : {})}
      className="grid w-full shrink-0 grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]"
      data-testid="announcement-slide"
    >
      <Link to={`/event/${e.id}`} tabIndex={-1} aria-hidden className="relative block aspect-[16/9] border-b border-rule bg-paper md:aspect-auto md:min-h-[320px] md:border-b-0 md:border-r">
        <Poster src={p.src} cover={false} label={hostName(e)} className={`absolute inset-0 size-full ${p.src ? '!bg-transparent p-4' : ''}`} />
      </Link>
      <div className="flex min-w-0 flex-col gap-4 p-6 md:p-8">
        <h3 className="text-xl font-bold">
          <Link to={`/event/${e.id}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">{e.title}</Link>
        </h3>
        <p className="line-clamp-4 max-w-[64ch] text-ink-2">{e.heroBlurb ?? e.description.replace(/\s*\n+\s*/g, ' ')}</p>
        <EventMeta e={e} size="md" />
        <div className="mt-auto pt-2">
          <Link to={`/event/${e.id}`} className="btn btn-secondary">Read announcement</Link>
        </div>
      </div>
    </article>
  )
}

function useReducedMotion() {
  const q = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setReduced(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return reduced
}

/** A titled row of cards: arrows + scroll-snap, no visible scrollbar. */
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
        className="scroll-row -mx-gutter mt-1 flex [contain:paint] snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-4 pt-3"
        data-testid={testId}
      >
        {items.map((e) => <EventCard key={e.id} e={e} />)}
        {!items.length && (empty ?? <p className="py-8 text-sm text-muted">Nothing here yet.</p>)}
      </div>
    </section>
  )
}
