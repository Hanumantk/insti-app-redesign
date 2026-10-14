import { useEffect, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LotusMark } from '../components/Brand'
import { A } from '../lib/assets'

/**
 * Gate family (design.md): content centred on paper; the brand squiggles stay pinned to the
 * bottom-left and top-right corners and scale with the viewport instead of the whole page zooming.
 * Each squiggle keeps Figma's rotate + mirror (relativeTransform), re-based on its render box.
 */
function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-[var(--vh-full)] place-items-center overflow-hidden bg-paper px-gutter py-12">
      <div className="pointer-events-none absolute bottom-0 left-0 h-[639px] w-[544px] origin-bottom-left scale-[var(--sq)]" aria-hidden>
        <img alt="" src={A.squiggleLeft} className="absolute left-0 top-0 h-[580.309px] w-[730.454px] max-w-none origin-top-left" style={{ transform: 'matrix(-0.969, -0.247, -0.247, 0.969, 544.291, 180.735)' }} />
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-[487px] w-[433px] origin-top-right scale-[var(--sq)]" aria-hidden>
        <img alt="" src={A.squiggleRight} className="absolute left-0 top-0 h-[522.825px] w-[505.962px] max-w-none origin-top-left" style={{ transform: 'matrix(-0.59, 0.807, 0.807, 0.59, 298.5, -229)' }} />
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}

/** 1:118 — shown for ~800ms between log in and home. */
export function LoadingPage() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const next = params.get('next') ?? '/login'
  const hold = params.get('hold') === '1'
  useEffect(() => {
    if (hold) return
    const t = setTimeout(() => nav(next, { replace: true }), 800)
    return () => clearTimeout(t)
  }, [nav, next, hold])

  return (
    <Stage>
      <div className="grid justify-items-center gap-2" role="status" aria-label="Loading Insti App">
        <LotusMark size={160} withBackdrop={false} />
        <p className="font-wordmark text-[44px] font-extrabold leading-none text-ink">InstiApp</p>
      </div>
    </Stage>
  )
}

/** 1:3 — every button continues as the role picked in the demo switcher. */
export function LoginPage() {
  const nav = useNavigate()
  const go = () => nav('/loading?next=/home')
  return (
    <Stage>
      <div className="w-full max-w-[424px] rounded-[28px] border border-rule bg-surface px-8 pb-10 pt-12 text-center shadow-[0_24px_64px_-32px_var(--color-squiggle)] sm:w-[424px]">
        <h1 className="text-display font-bold">Get started</h1>
        <p className="mx-auto mt-3 max-w-[30ch] text-lg leading-8 text-ink-2">
          All Things <span className="text-accent-strong">Insti</span> - right at your fingertips.
        </p>
        <div className="mt-10 grid gap-3">
          <button className="btn btn-primary h-12 w-full text-base" onClick={go} data-testid="login-sso">Log In via SSO</button>
          <button className="btn btn-primary h-12 w-full text-base" onClick={go} data-testid="login-alumnus">Log In as an alumnus</button>
          <div className="my-2 flex items-center gap-4 text-sm text-muted" aria-hidden>
            <span className="h-px flex-1 bg-rule" />or<span className="h-px flex-1 bg-rule" />
          </div>
          <button className="btn btn-secondary h-12 w-full border-accent text-base text-accent-strong" onClick={go} data-testid="login-guest">Continue as guest</button>
        </div>
      </div>
    </Stage>
  )
}
