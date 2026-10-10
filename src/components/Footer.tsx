import { ChatCircle, CheckFat, LinkSimple } from '@phosphor-icons/react'
import { A } from '../lib/assets'
import { LotusMark } from './Brand'
import { Page } from './ui'

/** Compact night band — replaces the 466px Figma footer on Browse and Detail screens. */
export function Footer() {
  return (
    <footer className="mt-16 bg-night text-night-ink">
      <Page className="grid gap-6 py-8 md:grid-cols-[1fr_auto] md:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="flex items-center gap-2">
              <LotusMark size={32} />
              <span className="font-wordmark text-xl font-extrabold leading-none text-accent-ink">InstiApp</span>
            </span>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              <span className="flex items-center gap-2"><ChatCircle size={18} aria-hidden />FAQs</span>
              <span className="flex items-center gap-2"><CheckFat size={18} aria-hidden />Achievements</span>
              <span className="flex items-center gap-2"><LinkSimple size={18} aria-hidden />Quick links</span>
            </nav>
          </div>
          <details className="mt-6 max-w-[72ch] border-t border-night-rule pt-4 text-sm">
            <summary className="cursor-pointer font-medium text-accent-ink">Terms &amp; Conditions</summary>
            <p className="mt-2 text-night-ink">
              By using this website, you agree to our terms, including proper use of the site and respect for all intellectual property. We are not responsible for inaccuracies, external links, or any damages arising from site use. Any personal information you provide will be handled as per our privacy practices. Continued use of the website indicates acceptance of any updates to these terms. For queries, contact us at the provided email.
            </p>
          </details>
        </div>
        <img alt="QR code for the Insti App" src={A.qr} className="size-24 rounded-tile bg-surface object-cover p-2" />
      </Page>
    </footer>
  )
}
