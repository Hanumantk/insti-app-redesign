import { ArrowLeft, Check, ImageSquare, Trash, WarningCircle } from '@phosphor-icons/react'
import { useId, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { ClubMark, Page, Poster } from '../components/ui'
import { CLUBS } from '../data/seed'
import type { EventType, InstiEvent } from '../data/types'
import { posterFor } from '../lib/events'
import { useApp, useEvent, type EventDraft } from '../store/useApp'

const TYPES: { t: EventType; label: string }[] = [
  { t: 'event', label: 'Event' },
  { t: 'competition', label: 'Competition' },
  { t: 'announcement', label: 'Announcement' },
]

export function EventFormPage() {
  const { id } = useParams()
  const role = useApp((s) => s.role)
  const existing = useEvent(id)
  if (role === 'student') return <Navigate to="/home" replace />
  if (id && !existing) return <Navigate to="/home" replace />
  return <EventForm key={id ?? 'new'} existing={existing} />
}

const draftFrom = (e?: InstiEvent): EventDraft => ({
  type: e?.type ?? 'event',
  title: e?.title ?? '',
  description: e?.description ?? '',
  moreDetails: e?.moreDetails ?? '',
  contact: e?.contact ?? '',
  regards: e?.regards ?? '',
  moreRegards: e?.moreRegards ?? '',
  instagram: e?.instagram ?? '',
  website: e?.website ?? '',
  date: (e?.deadline ?? e?.date ?? '').trim(),
  time: e?.time ?? '',
  venue: e?.venue ?? '',
  clubs: e?.clubs ?? [],
  uploadedPoster: e?.uploadedPoster,
})

type Req = 'title' | 'date' | 'venue'
const REQUIRED: Record<Req, string> = {
  title: 'Add a title — it’s what students see first.',
  date: 'Add the day, e.g. “Sat, 24 Jan”.',
  venue: 'Add where it happens, or “Online”.',
}

/** Form family (design.md): poster drop zone left, labelled fields right, sticky action bar. */
function EventForm({ existing }: { existing?: InstiEvent }) {
  const nav = useNavigate()
  const role = useApp((s) => s.role)
  const createEvent = useApp((s) => s.createEvent)
  const updateEvent = useApp((s) => s.updateEvent)
  const [d, setD] = useState<EventDraft>(() => draftFrom(existing))
  const [touched, setTouched] = useState<Partial<Record<Req, boolean>>>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const set = <K extends keyof EventDraft>(k: K, v: EventDraft[K]) => setD((x) => ({ ...x, [k]: v }))

  const errors = (Object.keys(REQUIRED) as Req[]).filter((k) => !String(d[k] ?? '').trim())
  const showErr = (k: Req) => !!touched[k] && errors.includes(k)
  const existingPoster = existing && !d.uploadedPoster ? posterFor(existing, 'detail') : null
  const posterSrc = d.uploadedPoster ?? existingPoster?.src
  const cancel = () => nav(-1)

  const submit = () => {
    setTouched({ title: true, date: true, venue: true })
    if (errors.length) {
      document.getElementById(`f-${errors[0]}`)?.focus()
      return
    }
    const clean: EventDraft = {
      ...d,
      title: d.title.trim(),
      description: d.description.trim(),
      date: d.date.trim(),
      venue: d.venue.trim(),
      moreDetails: d.moreDetails?.trim() || undefined,
      contact: d.contact?.trim() || undefined,
      regards: d.regards?.trim() || undefined,
      moreRegards: d.moreRegards?.trim() || undefined,
      instagram: d.instagram?.trim() || (existing?.instagram === '' ? '' : undefined),
      website: d.website?.trim() || (existing?.website === '' ? '' : undefined),
    }
    if (existing) {
      updateEvent(existing.id, clean)
      nav(`/event/${existing.id}`, { replace: true })
    } else {
      const nid = createEvent(clean)
      nav(role === 'gsha' ? `/home?tab=status&filter=all&id=${nid}` : `/event/${nid}`, { replace: true })
    }
  }

  const onFile = async (f?: File) => {
    if (f) set('uploadedPoster', await downscale(f, 549, 777))
  }

  const primaryLabel = existing ? 'Save changes' : role === 'gsec' ? 'Publish' : 'Submit for approval'

  return (
    <>
      <TopBar />
      <main className="pb-28">
        <Page className="pt-5">
          <button className="btn btn-ghost -ml-3" onClick={cancel}>
            <ArrowLeft size={16} aria-hidden />
            Back
          </button>
          <h1 className="mt-4 text-2xl font-bold">{existing ? 'Edit event' : 'New event'}</h1>
          {existing?.status === 'rejected' && (
            <p className="mt-2 max-w-[64ch] text-muted">After saving, use <span className="font-medium text-ink">Resend for approval</span> on the event so GSec sees your changes.</p>
          )}
        </Page>

        <Page className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] xl:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--topbar-h)+24px)]">
            <span className="field-label" id="poster-label">Poster</span>
            <button
              type="button"
              aria-labelledby="poster-label"
              aria-describedby="poster-help"
              onClick={() => fileRef.current?.click()}
              onDragOver={(ev) => ev.preventDefault()}
              onDrop={(ev) => { ev.preventDefault(); onFile(ev.dataTransfer.files?.[0]) }}
              className="group relative block aspect-[549/777] w-full overflow-hidden rounded-panel border border-dashed border-rule-strong bg-surface transition-colors duration-short ease-out hover:bg-surface-2"
              data-testid="poster-upload"
            >
              {posterSrc ? (
                <Poster src={posterSrc} cover={!existingPoster || existingPoster.cover} className="absolute inset-0 size-full bg-surface" />
              ) : (
                <span className="absolute inset-0 grid place-content-center justify-items-center gap-3 text-muted">
                  <ImageSquare size={48} aria-hidden />
                  <span className="text-[15px] font-medium text-ink">Add an image</span>
                  <span className="text-sm">Click or drop a file</span>
                </span>
              )}
            </button>
            <p id="poster-help" className="field-help">Portrait JPG or PNG works best. It’s cropped to 549 × 777.</p>
            {d.uploadedPoster && (
              <button type="button" className="btn btn-ghost -ml-3 mt-1 h-9" onClick={() => set('uploadedPoster', undefined)}>
                <Trash size={16} aria-hidden />
                Remove image
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(ev) => onFile(ev.target.files?.[0])} />
          </div>

          <form className="grid min-w-0 gap-10" onSubmit={(ev) => { ev.preventDefault(); submit() }} noValidate>
            <Section title="Basics">
              <fieldset>
                <legend className="field-label">Type</legend>
                <div className="flex w-fit gap-1 rounded-pill bg-surface-2 p-1" role="radiogroup" aria-label="Type" data-testid="f-type">
                  {TYPES.map(({ t, label }) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={d.type === t}
                      onClick={() => set('type', t)}
                      className={`h-9 whitespace-nowrap rounded-pill px-4 text-sm font-medium transition-colors duration-short ease-out ${
                        d.type === t ? 'bg-surface text-ink shadow-[0_1px_2px_var(--color-rule-strong)]' : 'text-muted hover:text-ink'
                      }`}
                      data-testid={`f-type-${t}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Field id="f-title" label="Title" required error={showErr('title') ? REQUIRED.title : undefined}>
                {(p) => <input {...p} className="input text-md" value={d.title} placeholder="Event name" onChange={(ev) => set('title', ev.target.value)} onBlur={() => setTouched((t) => ({ ...t, title: true }))} />}
              </Field>
              <Field id="f-description" label="Description" help="Two or three sentences. Shown on the card and the event page.">
                {(p) => <textarea {...p} className="input" rows={4} value={d.description} placeholder="What is the event about?" onChange={(ev) => set('description', ev.target.value)} />}
              </Field>
            </Section>

            <Section title="When and where">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Field id="f-date" label={d.type === 'competition' ? 'Deadline' : 'Day'} required error={showErr('date') ? REQUIRED.date : undefined}>
                  {(p) => <input {...p} className="input tnum" value={d.date} placeholder={d.type === 'competition' ? 'Deadline 22 Jan' : 'Sat, 24 Jan'} onChange={(ev) => set('date', ev.target.value)} onBlur={() => setTouched((t) => ({ ...t, date: true }))} />}
                </Field>
                <Field id="f-time" label="Time">
                  {(p) => <input {...p} className="input tnum" value={d.time} placeholder="7:00 PM" onChange={(ev) => set('time', ev.target.value)} />}
                </Field>
              </div>
              <Field id="f-venue" label="Venue" required error={showErr('venue') ? REQUIRED.venue : undefined}>
                {(p) => <input {...p} className="input" value={d.venue} placeholder="Music Room H-8" onChange={(ev) => set('venue', ev.target.value)} onBlur={() => setTouched((t) => ({ ...t, venue: true }))} />}
              </Field>
            </Section>

            <Section title="More details">
              <Field id="f-more" label="Details" help="Rules, notes, what to bring. Wrap a word in **double stars** to bold it.">
                {(p) => <textarea {...p} className="input" rows={6} value={d.moreDetails} onChange={(ev) => set('moreDetails', ev.target.value)} />}
              </Field>
              <Field id="f-contact" label="Contact" help="Name and phone number.">
                {(p) => <input {...p} className="input tnum" value={d.contact} onChange={(ev) => set('contact', ev.target.value)} />}
              </Field>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Field id="f-regards" label="Thanks and Regards">
                  {(p) => <textarea {...p} className="input" rows={4} value={d.regards} onChange={(ev) => set('regards', ev.target.value)} />}
                </Field>
                <Field id="f-more-regards" label="More Regards">
                  {(p) => <textarea {...p} className="input" rows={4} value={d.moreRegards} onChange={(ev) => set('moreRegards', ev.target.value)} />}
                </Field>
              </div>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Field id="f-instagram" label="Instagram link">
                  {(p) => <input {...p} className="input" type="url" inputMode="url" value={d.instagram} placeholder="https://instagram.com/…" onChange={(ev) => set('instagram', ev.target.value)} />}
                </Field>
                <Field id="f-website" label="Website link">
                  {(p) => <input {...p} className="input" type="url" inputMode="url" value={d.website} placeholder="https://…" onChange={(ev) => set('website', ev.target.value)} />}
                </Field>
              </div>
            </Section>

            <Section title="Clubs">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Clubs">
                {Object.values(CLUBS).map((c) => {
                  const on = d.clubs.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set('clubs', on ? d.clubs.filter((x) => x !== c.id) : [...d.clubs, c.id])}
                      className={`flex items-center gap-3 rounded-tile border py-2 pl-2 pr-4 text-left transition-colors duration-short ease-out ${
                        on ? 'border-accent bg-accent-tint' : 'border-rule-strong bg-surface hover:bg-surface-2'
                      }`}
                      data-testid="add-club"
                    >
                      <ClubMark name={c.name} logo={c.logo} size={36} />
                      <span className="text-[15px] font-medium text-ink">{c.name.trim()}</span>
                      {on && <Check size={16} weight="bold" className="text-accent-strong" aria-hidden />}
                    </button>
                  )
                })}
              </div>
            </Section>
            <button type="submit" hidden />
          </form>
        </Page>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-surface">
        <Page className="flex h-[72px] items-center justify-end gap-3">
          {errors.length > 0 && Object.values(touched).some(Boolean) && (
            <p className="mr-auto flex items-center gap-2 text-sm text-bad" role="status">
              <WarningCircle size={18} aria-hidden />
              {errors.length === 1 ? '1 required field is empty' : `${errors.length} required fields are empty`}
            </p>
          )}
          <button type="button" className="btn btn-ghost h-11" onClick={cancel}>Cancel</button>
          <button type="button" className="btn btn-primary h-11" onClick={submit} data-testid="f-submit">{primaryLabel}</button>
        </Page>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  id, label, help, error, required, children,
}: {
  id: string
  label: string
  help?: string
  error?: string
  required?: boolean
  children: (p: { id: string; 'aria-invalid': boolean; 'aria-describedby': string; 'aria-required'?: boolean; 'data-testid': string }) => ReactNode
}) {
  const helpId = useId()
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="ml-1 font-normal text-muted">(required)</span>}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': helpId, 'aria-required': required, 'data-testid': id })}
      <p id={helpId} className="field-help" data-error={!!error}>{error ?? help}</p>
    </div>
  )
}

/** Cover-crop an uploaded image to the poster frame so it fits in localStorage. */
function downscale(file: File, w: number, h: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const s = Math.max(w / img.width, h / img.height)
      c.getContext('2d')!.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s)
      URL.revokeObjectURL(img.src)
      resolve(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
