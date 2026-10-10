import { ArrowLeft, ShareNetwork } from '@phosphor-icons/react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DecisionBar, EventBody, History } from '../components/EventDetail'
import { Footer } from '../components/Footer'
import { TopBar } from '../components/TopBar'
import { EventMeta, Page, Poster } from '../components/ui'
import type { InstiEvent } from '../data/types'
import { hostName, posterFor, typeLabel } from '../lib/events'
import { useApp, useEvent } from '../store/useApp'

export function EventPage() {
  const { id } = useParams()
  const e = useEvent(id)
  if (!e) return <Navigate to="/home" replace />
  return <EventView key={e.id} e={e} />
}

/** Detail family (design.md): poster sticky left, details scroll right. */
function EventView({ e }: { e: InstiEvent }) {
  const nav = useNavigate()
  const role = useApp((s) => s.role)
  const mine = useApp((s) => s.reactions[e.id])
  const toggle = useApp((s) => s.toggleReaction)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const poster = posterFor(e, 'detail')
  const isReviewer = role === 'gsec' || (role === 'gsha' && e.createdBy === 'gsha')
  const backTo = role === 'gsec' ? '/home?tab=approvals' : role === 'gsha' && e.createdBy === 'gsha' ? '/home?tab=status' : '/home'

  const share = async () => {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard blocked — nothing to report */
    }
  }

  return (
    <>
      <TopBar />
      <main>
        <Page className="pt-5">
          <button className="btn btn-ghost -ml-3" onClick={() => (history.length > 1 ? nav(-1) : nav(backTo))}>
            <ArrowLeft size={16} aria-hidden />
            Back
          </button>
        </Page>
        <Page className="mt-4 grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--topbar-h)+24px)]">
            <Poster
              src={poster.src}
              label={hostName(e)}
              cover={poster.cover}
              className={`aspect-[549/777] w-full rounded-panel border border-rule ${poster.cover ? '' : 'bg-surface'}`}
              alt={`Poster for ${e.title}`}
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <ReactButton label="Interested" n={e.interested + (mine?.interested ? 1 : 0)} on={!!mine?.interested} onClick={() => toggle(e.id, 'interested')} testId="interested" />
              <ReactButton label="Going" n={e.going + (mine?.going ? 1 : 0)} on={!!mine?.going} onClick={() => toggle(e.id, 'going')} testId="going" />
            </div>
          </div>

          <article className="grid min-w-0 gap-8">
            {isReviewer && (
              <div className="border-b border-rule pb-6">
                <DecisionBar
                  e={e}
                  role={role}
                  rejectOpen={rejectOpen}
                  setRejectOpen={setRejectOpen}
                  onDecided={() => role === 'gsec' && nav('/home?tab=approvals')}
                />
              </div>
            )}
            <header className="grid gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted">{typeLabel[e.type]}</span>
                <button className="btn btn-ghost ml-auto h-9 px-3" onClick={share} aria-live="polite">
                  <ShareNetwork size={16} aria-hidden />
                  {copied ? 'Link copied' : 'Share'}
                </button>
              </div>
              <h1 className="text-2xl font-bold lg:text-display">{e.title}</h1>
              <EventMeta e={e} size="md" />
            </header>
            <EventBody e={e} />
            {isReviewer && <History e={e} />}
          </article>
        </Page>
      </main>
      <Footer />
    </>
  )
}

function ReactButton({ label, n, on, onClick, testId }: { label: string; n: number; on: boolean; onClick: () => void; testId: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`btn h-11 justify-between px-5 ${on ? 'border-accent bg-accent-tint text-accent-strong' : 'btn-secondary'}`}
      data-testid={testId}
    >
      {label}
      <span className="tnum font-bold" data-testid={`${testId}-count`}>{n}</span>
    </button>
  )
}
