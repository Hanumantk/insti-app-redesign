import { A } from '../lib/assets'

/** Lotus mark as composed in Figma: a round backdrop image plus a cropped lotus layer. */
export function LotusMark({ size, withBackdrop = true }: { size: number; withBackdrop?: boolean }) {
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }} aria-hidden>
      {withBackdrop && <img alt="" src={A.logoBg} className="absolute inset-0 size-full rounded-full object-cover" />}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <img alt="" src={A.logoLotus} className="absolute left-[-18%] top-0 h-full w-[223.52%] max-w-none" />
      </span>
    </span>
  )
}
