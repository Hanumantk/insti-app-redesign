import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Role } from '../data/types'
import { useApp } from '../store/useApp'

const ROLES: { r: Role; label: string }[] = [
  { r: 'student', label: 'Student' },
  { r: 'gsha', label: 'GSHA' },
  { r: 'gsec', label: 'GSec' },
]

/**
 * Demo control — deliberately NOT part of the Figma design (neutral dark pill, 12px).
 * Hidden with ?demo=0 for clean screenshots.
 */
export function RoleSwitcher() {
  const [params] = useSearchParams()
  const { pathname, search } = useLocation()
  const nav = useNavigate()
  const role = useApp((s) => s.role)
  const setRole = useApp((s) => s.setRole)
  const resetDemo = useApp((s) => s.resetDemo)

  if (params.get('demo') === '0') return null

  const pick = (r: Role) => {
    setRole(r)
    const tab = params.get('tab')
    const onForm = pathname === '/event/new' || pathname.endsWith('/edit')
    if (r === 'student' && onForm) return nav('/home')
    if (pathname === '/home' && tab) {
      const ok = (tab === 'status' && r === 'gsha') || (tab === 'approvals' && r === 'gsec')
      if (!ok) return nav('/home')
    }
    nav(pathname + search, { replace: true })
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-[100] flex items-center gap-1 rounded-pill bg-ink p-1 text-xs leading-none text-accent-ink shadow-toast"
      role="group"
      aria-label="Demo role"
      data-testid="role-switcher"
    >
      <span className="px-2 text-night-ink">View as</span>
      {ROLES.map(({ r, label }) => (
        <button
          key={r}
          onClick={() => pick(r)}
          aria-pressed={role === r}
          className={`rounded-pill px-3 py-2 ${role === r ? 'bg-surface text-ink' : 'text-night-ink hover:bg-night'}`}
          data-testid={`role-${r}`}
        >
          {label}
        </button>
      ))}
      <span className="mx-1 h-3.5 w-px bg-night-rule" />
      <button
        onClick={() => { if (confirm('Reset the demo data to the seed?')) resetDemo() }}
        className="rounded-pill px-3 py-2 text-night-ink hover:bg-night"
        title="Reset demo data"
      >
        Reset
      </button>
    </div>
  )
}
