import { useEffect, useRef } from 'react'
import { useApp } from '../store/useApp'

/** One toast at a time, bottom-right, 6s dwell (paused while hovered or focused). */
export function Toast() {
  const toast = useApp((s) => s.toast)
  const dismiss = useApp((s) => s.dismissToast)
  const restore = useApp((s) => s.restore)
  const timer = useRef<number>()

  const arm = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(dismiss, 6000)
  }
  useEffect(() => {
    if (!toast) return
    arm()
    return () => window.clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id])

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60]" aria-live="polite">
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto flex animate-[toast-in_320ms_var(--ease-out)] items-center gap-4 rounded-tile bg-night py-3 pl-4 pr-2 text-sm text-accent-ink shadow-toast"
          onMouseEnter={() => window.clearTimeout(timer.current)}
          onMouseLeave={arm}
          onFocus={() => window.clearTimeout(timer.current)}
          onBlur={arm}
          data-testid="toast"
        >
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              className="btn h-8 bg-transparent px-3 text-accent-ink underline decoration-1 underline-offset-4"
              onClick={() => {
                restore(toast.undo!)
                dismiss()
              }}
              data-testid="toast-undo"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
