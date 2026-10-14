import { CalendarBlank, CheckCircle, Clock, MapPin, XCircle } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import type { InstiEvent, Status } from '../data/types'
import { dateLabel } from '../lib/events'

const tone: Record<Status, { cls: string; label: string; Icon: typeof CheckCircle }> = {
  approved: { cls: 'bg-ok-tint text-ok border-ok-rule', label: 'Approved', Icon: CheckCircle },
  rejected: { cls: 'bg-bad-tint text-bad border-bad-rule', label: 'Rejected', Icon: XCircle },
  pending: { cls: 'bg-wait-tint text-wait border-wait-rule', label: 'Pending', Icon: Clock },
}

/** Status is always icon + word, never colour alone. */
export function StatusPill({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' }) {
  const t = tone[status]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-pill border font-medium ${t.cls} ${
        size === 'md' ? 'h-8 px-3 text-sm' : 'h-6 px-2 text-xs'
      }`}
      data-testid="status-pill"
    >
      <t.Icon size={size === 'md' ? 16 : 14} weight="bold" aria-hidden />
      {t.label}
    </span>
  )
}

export function CountBadge({ n, label }: { n: number; label: string }) {
  if (!n) return null
  return (
    <span className="tnum inline-grid h-5 min-w-5 place-items-center rounded-pill bg-badge px-1 text-xs font-medium text-accent-ink" aria-label={label}>
      {n}
    </span>
  )
}

/** Date/time and venue rows shared by cards, rows, panels and pages. */
export function EventMeta({ e, size = 'sm', className = '' }: { e: InstiEvent; size?: 'sm' | 'md'; className?: string }) {
  const icon = size === 'md' ? 20 : 16
  const text = size === 'md' ? 'text-base' : 'text-sm'
  return (
    <dl className={`grid gap-2 ${text} ${className}`}>
      <div className="flex items-center gap-2">
        <dt className="sr-only">Date and time</dt>
        <CalendarBlank size={icon} className="shrink-0 text-accent" aria-hidden />
        <dd className="tnum truncate text-ink-2">
          {dateLabel(e)}
          {e.time && <span className="text-muted"> · </span>}
          {e.time}
        </dd>
      </div>
      <div className="flex items-center gap-2">
        <dt className="sr-only">Venue</dt>
        <MapPin size={icon} className="shrink-0 text-accent" aria-hidden />
        <dd className="truncate text-ink-2">{e.venue || '—'}</dd>
      </div>
    </dl>
  )
}

/**
 * Event poster. Live events often have none — then the organiser's name stands in on a tint
 * (`label`), or just its initials on small thumbnails (`small`).
 */
export function Poster({
  src, cover = true, className = '', alt = '', label, small = false,
}: { src?: string; cover?: boolean; className?: string; alt?: string; label?: string; small?: boolean }) {
  return (
    <div className={`overflow-hidden ${src ? (cover ? '' : 'bg-surface') : 'bg-accent-tint'} ${className}`}>
      {src ? (
        <img alt={alt} src={src} className={`size-full ${cover ? 'object-cover' : 'object-contain'}`} loading="lazy" />
      ) : (
        <div className="grid size-full place-items-center p-3 text-center font-bold text-accent-strong" aria-hidden={!label}>
          {small ? <span className="text-sm">{initials(label ?? '')}</span> : <span className="max-w-[16ch] text-lg leading-6">{label ?? 'No poster'}</span>}
        </div>
      )}
    </div>
  )
}

const initials = (name: string) =>
  name.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`w-full px-gutter ${className}`}>{children}</div>
}

/** Renders "**x**" as Medium; keeps blank lines. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <p key={i} className="min-h-6">
          {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
            part.startsWith('**') ? <strong key={j} className="font-medium text-ink">{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>,
          )}
        </p>
      ))}
    </>
  )
}

/** Club logo, or a monogram when the club has none (the live feed doesn't ship club logos). */
export function ClubMark({ name, logo, size }: { name: string; logo?: string; size: 36 | 40 }) {
  const box = size === 40 ? 'size-10' : 'size-9'
  if (logo) return <img alt="" src={logo} className={`${box} shrink-0 rounded-[8px] object-cover`} />
  const initials = name.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <span aria-hidden className={`${box} grid shrink-0 place-items-center rounded-[8px] bg-accent-tint text-sm font-bold text-accent-strong`}>
      {initials}
    </span>
  )
}
