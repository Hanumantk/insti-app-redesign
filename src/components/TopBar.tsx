import { Bell, CaretDown, MagnifyingGlass, UserCircle } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { LotusMark } from './Brand'

/**
 * App top bar — the Figma bar (75:581) tightened from 96px to 64px. Only "Events" has
 * a destination in this prototype; the rest keep their Figma labels but are marked unavailable.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-30 h-topbar border-b border-rule bg-surface">
      <div className="flex h-full items-center gap-6 px-gutter">
        <Link to="/home" className="flex shrink-0 items-center gap-2 rounded-pill" aria-label="Insti App home">
          <LotusMark size={36} />
          <span className="whitespace-nowrap font-wordmark text-[26px] font-extrabold leading-none tracking-[-0.01em] text-ink">Insti App</span>
        </Link>
        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 md:flex">
          <Link to="/home" aria-current="page" className="rounded-pill bg-accent-tint px-4 py-2 text-[15px] font-medium leading-none text-accent-strong">
            Events
          </Link>
          {['News', 'Blogs', 'Communitites', 'Map'].map((l) => (
            <span key={l} title="Not part of this prototype" className="flex cursor-default items-center gap-1 px-3 py-2 text-[15px] font-medium leading-none text-ink-2">
              {l}
              {l === 'Blogs' && <CaretDown size={14} aria-hidden />}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button className="icon-btn" aria-label="Search (not part of this prototype)" disabled>
            <MagnifyingGlass size={22} />
          </button>
          <span className="icon-btn relative" aria-label="3 notifications">
            <Bell size={22} aria-hidden />
            <span className="tnum absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-pill bg-badge text-[10px] font-medium leading-none text-accent-ink">3</span>
          </span>
          <span className="icon-btn" aria-label="Profile">
            <UserCircle size={30} aria-hidden />
          </span>
        </div>
      </div>
    </header>
  )
}
