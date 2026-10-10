import { X } from '@phosphor-icons/react'
import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Right-hand sheet over a scrim. Esc, scrim click and the close button all dismiss.
 * Focus moves into the sheet on open and back to the opener on close.
 */
export function Sheet({
  title, onClose, children, footer, width = 420, testId,
}: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: number; testId?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const r = ref.current
    ;(r?.querySelector<HTMLElement>('[data-autofocus]') ?? r?.querySelector<HTMLElement>('button, input'))?.focus()
    const onKey = (ev: KeyboardEvent) => ev.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      opener?.focus?.()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 animate-[fade_240ms_var(--ease-out)] cursor-default bg-scrim" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full animate-[sheet-in_240ms_var(--ease-out)] flex-col bg-surface shadow-sheet"
        style={{ maxWidth: width }}
        data-testid={testId}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-rule px-6">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="icon-btn -mr-2" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose} data-testid={`${testId}-close`}>
            <X size={22} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t border-rule px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
