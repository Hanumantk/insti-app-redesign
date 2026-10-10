import {
  ArrowClockwise, ChatCircleText, Check, CheckCircle, Clock, FlowerLotus, InstagramLogo, PaperPlaneTilt,
  PencilSimple, Phone, X, XCircle,
} from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLUBS } from '../data/seed'
import type { HistoryEntry, InstiEvent, Role } from '../data/types'
import { typeLabel, when } from '../lib/events'
import { useApp } from '../store/useApp'
import { ClubMark, Rich, StatusPill } from './ui'

/**
 * Role-aware decision bar, shared by the review panel and the event page.
 * GSec: Approve / Reject (inline reason) / Edit. GSHA on their own event: status, Edit,
 * the rejection reason printed in full, and Resend for approval.
 */
export function DecisionBar({
  e, role, onDecided, rejectOpen, setRejectOpen,
}: {
  e: InstiEvent
  role: Role
  onDecided?: (kind: 'approved' | 'rejected') => void
  rejectOpen: boolean
  setRejectOpen: (o: boolean) => void
}) {
  const nav = useNavigate()
  const approve = useApp((s) => s.approve)
  const reject = useApp((s) => s.reject)
  const resend = useApp((s) => s.resend)
  const showToast = useApp((s) => s.showToast)
  const edit = () => nav(`/event/${e.id}/edit`)

  if (role === 'student' || (role === 'gsha' && e.createdBy !== 'gsha')) return null

  const doApprove = () => {
    const before = approve(e.id)
    if (before) showToast({ message: `Approved “${e.title}”`, undo: before })
    onDecided?.('approved')
  }

  if (role === 'gsec') {
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={e.status} size="md" />
          <span className="text-sm text-muted">{typeLabel[e.type]} · submitted by {e.createdBy === 'gsec' ? 'GSec' : 'GSHA'}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            {e.status !== 'approved' && (
              <button className="btn btn-ok" onClick={doApprove} data-testid="page-approve" aria-keyshortcuts="A">
                <Check size={16} weight="bold" aria-hidden />
                Approve
              </button>
            )}
            {e.status !== 'rejected' && (
              <button
                className="btn btn-bad"
                onClick={() => setRejectOpen(true)}
                aria-expanded={rejectOpen}
                data-testid="page-reject"
                aria-keyshortcuts="R"
              >
                <X size={16} weight="bold" aria-hidden />
                Reject
              </button>
            )}
            <button className="btn btn-secondary" onClick={edit} data-testid="page-edit" aria-keyshortcuts="E">
              <PencilSimple size={16} aria-hidden />
              Edit
            </button>
          </div>
        </div>
        {rejectOpen && (
          <RejectForm
            onCancel={() => setRejectOpen(false)}
            onSend={(c) => {
              reject(e.id, c)
              setRejectOpen(false)
              onDecided?.('rejected')
            }}
          />
        )}
        {e.status === 'rejected' && e.rejectionComment && !rejectOpen && <Reason text={e.rejectionComment} title="Your reason" />}
      </div>
    )
  }

  // GSHA, own event
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2" data-testid="page-status">
        <StatusPill status={e.status} size="md" />
        <span className="text-sm text-muted">
          {e.status === 'pending' && 'Waiting for GSec review'}
          {e.status === 'approved' && 'Live in the student feed'}
          {e.status === 'rejected' && 'Edit and resend when you’ve made changes'}
        </span>
        <div className="ml-auto flex gap-2">
          <button className="btn btn-secondary" onClick={edit} data-testid="page-edit">
            <PencilSimple size={16} aria-hidden />
            Edit
          </button>
          {e.status === 'rejected' && (
            <button className="btn btn-primary" onClick={() => resend(e.id)} data-testid="resend">
              <ArrowClockwise size={16} weight="bold" aria-hidden />
              Resend for approval
            </button>
          )}
        </div>
      </div>
      {e.status === 'rejected' && (
        e.rejectionComment
          ? <Reason text={e.rejectionComment} title="GSec’s comment" />
          : <p className="rounded-tile border border-rule bg-paper px-4 py-3 text-sm text-muted">GSec rejected this without a comment.</p>
      )}
    </div>
  )
}

function Reason({ text, title }: { text: string; title: string }) {
  return (
    <figure className="rounded-tile border border-bad-rule bg-bad-tint px-4 py-3" data-testid="rejection-reason">
      <figcaption className="flex items-center gap-2 text-sm font-medium text-bad">
        <ChatCircleText size={18} aria-hidden />
        {title}
      </figcaption>
      <blockquote className="mt-1 max-w-[68ch] text-[15px] text-ink">{text}</blockquote>
    </figure>
  )
}

function RejectForm({ onSend, onCancel }: { onSend: (c: string) => void; onCancel: () => void }) {
  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const id = useId()
  useEffect(() => ref.current?.focus(), [])
  const invalid = touched && !text.trim()

  const send = () => {
    setTouched(true)
    if (!text.trim()) return ref.current?.focus()
    onSend(text.trim())
  }

  return (
    <form
      className="rounded-tile border border-rule bg-paper p-4"
      onSubmit={(ev) => { ev.preventDefault(); send() }}
      onKeyDown={(ev) => {
        if (ev.key === 'Escape') { ev.stopPropagation(); onCancel() }
        if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) send()
      }}
      data-testid="reject-modal"
    >
      <label htmlFor={id} className="field-label">Reason for rejecting</label>
      <textarea
        id={id}
        ref={ref}
        className="input"
        rows={3}
        value={text}
        onChange={(ev) => setText(ev.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={invalid}
        aria-describedby={`${id}-help`}
        placeholder="What should the creator change?"
        data-testid="reject-text"
      />
      <p id={`${id}-help`} className="field-help" data-error={invalid}>
        {invalid ? 'Add a reason so the creator knows what to change.' : 'The creator sees this next to their event. Ctrl + Enter sends.'}
      </p>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-bad" data-testid="reject-send">
          <PaperPlaneTilt size={16} aria-hidden />
          Send rejection
        </button>
      </div>
    </form>
  )
}

/** Description, more details, contact, sign-offs, socials, clubs. Blocks without copy are omitted. */
export function EventBody({ e, compact = false }: { e: InstiEvent; compact?: boolean }) {
  const clubs = e.clubs.map((c) => CLUBS[c]).filter(Boolean)
  const body = compact ? 'max-w-[68ch] text-[15px] leading-6' : 'max-w-[68ch] text-base leading-7'
  return (
    <div className={`grid ${compact ? 'gap-6' : 'gap-8'}`}>
      {e.description && <p className={`whitespace-pre-line break-words text-ink-2 ${body}`}><Linkified text={e.description} /></p>}

      {(e.moreDetails || e.contact || e.regards || e.moreRegards) && (
        <section className={`grid gap-5 ${compact ? '' : 'rounded-panel border border-rule bg-surface p-6'}`}>
          <h2 className={compact ? 'text-md font-bold' : 'text-lg font-bold'}>More details</h2>
          {e.moreDetails && <div className={`text-ink-2 ${body}`}><Rich text={e.moreDetails} /></div>}
          {e.contact && (
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-accent-tint text-accent"><Phone size={20} aria-hidden /></span>
              <div>
                <div className="text-sm text-muted">Contact</div>
                <div className="tnum font-medium text-ink">{e.contact}</div>
              </div>
            </div>
          )}
          {(e.regards || e.moreRegards) && (
            <div className={`grid gap-5 ${compact ? '' : 'sm:grid-cols-2'}`}>
              {e.regards && <p className={`whitespace-pre-line text-ink-2 ${body}`}>{e.regards}</p>}
              {e.moreRegards && <p className={`whitespace-pre-line text-ink-2 ${body}`}>{e.moreRegards}</p>}
            </div>
          )}
          {(e.instagram !== undefined || e.website !== undefined) && (
            <div className="flex gap-2">
              {e.instagram !== undefined && <Social label="Instagram" href={e.instagram}><InstagramLogo size={20} /></Social>}
              {e.website !== undefined && <Social label="Website" href={e.website}><FlowerLotus size={20} /></Social>}
            </div>
          )}
        </section>
      )}

      {clubs.length > 0 && (
        <section>
          <h2 className="sr-only">Clubs</h2>
          <ul className="flex flex-wrap gap-3">
            {clubs.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-tile border border-rule bg-surface py-2 pl-2 pr-4">
                <ClubMark name={c.name} logo={c.logo} size={40} />
                <span>
                  <span className="block text-[15px] font-medium text-ink">{c.name.trim()}</span>
                  <span className="block text-sm text-muted">{c.tagline}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Social({ label, href, children }: { label: string; href?: string; children: React.ReactNode }) {
  const cls = 'grid size-10 place-items-center rounded-tile bg-accent-tint text-accent'
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls} aria-label={label}>{children}</a>
  ) : (
    <span className={cls} aria-label={`${label} (no link added)`} title="No link added">{children}</span>
  )
}

const stepCopy: Record<HistoryEntry['kind'], { text: (h: HistoryEntry) => string; Icon: typeof Check; cls: string }> = {
  submitted: { text: () => 'Submitted by GSHA', Icon: Clock, cls: 'text-wait' },
  resubmitted: { text: () => 'Resent for approval by GSHA', Icon: ArrowClockwise, cls: 'text-wait' },
  edited: { text: (h) => `Edited by ${h.by === 'gsec' ? 'GSec' : 'GSHA'}`, Icon: PencilSimple, cls: 'text-muted' },
  approved: { text: () => 'Approved by GSec', Icon: CheckCircle, cls: 'text-ok' },
  rejected: { text: () => 'Rejected by GSec', Icon: XCircle, cls: 'text-bad' },
  published: { text: () => 'Published by GSec', Icon: CheckCircle, cls: 'text-ok' },
}

/** Review trail, newest first. */
export function History({ e }: { e: InstiEvent }) {
  if (!e.history?.length) return null
  const steps = [...e.history].reverse()
  return (
    <section>
      <h2 className="text-md font-bold">History</h2>
      <ol className="mt-3 grid gap-3" data-testid="history">
        {steps.map((h, i) => {
          const s = stepCopy[h.kind]
          return (
            <li key={i} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 text-sm">
              <s.Icon size={20} className={s.cls} aria-hidden />
              <div>
                <span className="font-medium text-ink">{s.text(h)}</span>
                {when(h.at) && <span className="tnum text-muted"> · {when(h.at)}</span>}
                {h.comment && <p className="mt-1 max-w-[68ch] text-ink-2">“{h.comment}”</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/** Live descriptions carry plain URLs and emails (forms, WhatsApp groups, SWC); make them clickable. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]*\w)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (/^https?:\/\//.test(p)) {
          return <a key={i} href={p} target="_blank" rel="noreferrer" className="break-all text-accent-strong underline underline-offset-4">{p}</a>
        }
        if (/^[\w.+-]+@[\w-]+\.[\w.]*\w$/.test(p)) {
          return <a key={i} href={`mailto:${p}`} className="text-accent-strong underline underline-offset-4">{p}</a>
        }
        return <span key={i}>{p}</span>
      })}
    </>
  )
}
