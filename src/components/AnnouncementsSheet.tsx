import { Link } from 'react-router-dom'
import type { InstiEvent } from '../data/types'
import { hostName, posterFor } from '../lib/events'
import { EventMeta, Poster } from './ui'
import { Sheet } from './Sheet'

/** 110:2365 rebuilt as a 560px sheet with compact items. */
export function AnnouncementsSheet({ items, onClose }: { items: InstiEvent[]; onClose: () => void }) {
  return (
    <Sheet title="Announcements" onClose={onClose} width={560} testId="announcements-panel">
      <ul className="divide-y divide-rule">
        {items.map((e) => {
          const [greeting, ...rest] = e.description.split('\n')
          return (
            <li key={e.id}>
              <Link to={`/event/${e.id}`} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 px-6 py-5 hover:bg-paper">
                <Poster src={posterFor(e, 'detail').src} label={hostName(e)} small className="aspect-[4/5] w-24 rounded-tile" />
                <div className="min-w-0">
                  <h3 className="text-md font-medium">{e.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {greeting} {rest.join(' ')}
                  </p>
                  <EventMeta e={e} className="mt-3" />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
