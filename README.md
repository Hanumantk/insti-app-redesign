# Insti App: redesign (iterated version)

This is the iterated version of the Insti App prototype. The **Figma-faithful build** is in
[Hanumantk/insti-app-figma](https://github.com/Hanumantk/insti-app-figma). This version keeps the Insti App **tone**: Insti blue on the cool
`#F4F8FF` page, the lotus wordmark, friendly pill actions. What it rebuilds is the structure, around
the main job: **GSHA and GSec reviewing events on a laptop.** Its feed shows **real posts from
[insti.app/feed](https://www.insti.app/feed)** alongside the Figma posts (see § Data).

**Live demo:** https://hanumantk.github.io/insti-app-redesign/
(switch to **GSec** at the bottom-left and open
[Event Approvals](https://hanumantk.github.io/insti-app-redesign/home?tab=approvals) for the review workspace).
The hosted build uses fallback fonts, because Neue Montreal isn't public (see § Fonts).

The locked design system is in [`design.md`](design.md), and the tokens are in [`src/styles/tokens.css`](src/styles/tokens.css).

## Run it

```bash
npm install
npm run dev          # http://localhost:5540  (the Figma build runs on 5530)
```

The Neue Montreal font files aren't in the repo (see § Fonts). Without them, text falls back to
Helvetica Neue or Arial.

| Command | What it does |
|---|---|
| `npm run build` | Type-check and production build |
| `npx playwright test qa/demo-loop.spec.ts` | Full demo loop, the filter sheet, keyboard review, and a no-overflow check at 320/390/768px |
| `npx playwright test qa/shots.spec.ts` | Review screenshots → `qa/shots/` (1440, 1280 and 390 wide) |
| `npm run sync:feed` | Re-snapshot the live insti.app feed (see § Data) |
| `npm run deploy` | Build for GitHub Pages and publish `dist/` to the `gh-pages` branch (the live demo) |

The role switcher (bottom-left, **View as: Student · GSHA · GSec · Reset**) works as before. `?demo=0` hides it.
Data is stored under its own key (`insti-redesign-v3`), so the two builds don't share demo state.
**Reset** reloads the snapshot.

## Data — live insti.app posts + the Figma posts

The feed combines two sources:

| Source | What it adds |
|---|---|
| **Live insti.app** ([`src/data/live-feed.json`](src/data/live-feed.json)) | 24 posts from 13 bodies: **19 events, 2 competitions, 3 announcements**. Every post starting since **1 Sep 2026**, plus anything still running (e.g. the year-long Industrial Learning Program). 21 posters in `public/assets/live/`. Listed first in each row, newest first. |
| **Figma mock** ([`src/data/figma-seed.ts`](src/data/figma-seed.ts)) | The original posts, restored: the **Recommended** hero (Curious Community), 4 events, 4 competitions, 4 announcements, and the 5 GSHA submissions behind Event status / Event Approvals. Listed after the live posts. |

**Refreshing the live posts.** `npm run sync:feed` ([`scripts/sync-feed.mjs`](scripts/sync-feed.mjs)) snapshots the public API
behind https://www.insti.app/feed (`https://gymkhana.iitb.ac.in/instiapp/api/events`; `api.insti.app`
redirects there). It merges two calls:
- the date-range call the site's Calendar uses (`?start&end`);
- the plain feed call, which for logged-out visitors only returns posts that haven't ended.

Change the window with `SINCE=2026-08-01 npm run sync:feed`. Posters for posts that drop out are deleted.
The snapshot was taken on 11 Oct 2026.

- **Pending posts show up, as on insti.app.** The site lists posts publicly whatever their review state
  (20 of the 24 are "pending" in the API). So every live post is in the student feed; the API value is kept
  as `apiStatus`. The GSec approval queue holds the Figma submissions plus anything created in the demo.
- **Type is inferred,** because the API has no event / competition / announcement field.
  - "registration" or "trials" in the title → Competition.
  - A notice running more than 60 days → Announcement.
  - Everything else → Event.
- **Privacy.** 14 personal mobile numbers are replaced with "[number removed]". The SWC post's institutional
  emergency lines (IITB Hospital, QRT, 24/7 helpline) are kept.
- **Gaps in the source.** 3 posts have no poster, so the organising body's name stands in. Bodies have no logos
  in the snapshot, so their initials are shown.
- **Logged-in data isn't included.** A logged-in insti.app feed may show more (personalised posts, followed
  bodies); that needs a login, which this script doesn't use.
- **Attribution.** Live post text and the posters in `public/assets/live/` belong to their organising bodies
  at IIT Bombay and are published on insti.app. They're included here only to demo the interface, with
  personal phone numbers removed. If you organised one of these posts and want it taken down, open an
  issue and it will be removed.
- **Figma contact numbers.** The three contact numbers in the Figma mock's Peer Connect post also read
  "[number removed]".

Known inconsistencies in the source posts are in [`KNOWN_COPY_ISSUES.md`](KNOWN_COPY_ISSUES.md).

## What changed, and why

| Problem in the Figma build | What this version does |
|---|---|
| GSec had to hunt for pending items in a poster grid where all statuses were mixed together | **Review workspace** (`/home?tab=approvals`): a queue on the left (Pending · Rejected · Approved · All, with counts and search) and a detail panel on the right. Approve, Reject and Edit sit in the panel. After a decision, the next item is selected automatically. Keys: **J/K** move, **A** approve, **R** reject, **E** edit. |
| The creator only saw the rejection reason by hovering a small icon | The **reason is printed in full** in the panel and on the event page, next to **Resend for approval**. A **History** list shows submitted → rejected (with the comment) → resent → approved. |
| Reject was a modal; Approve had no undo | Reject opens an **inline required field** ("Add a reason so the creator knows what to change."). Approve takes effect immediately, with a **6-second Undo** toast. No confirmation dialogs. |
| GSec saw Approve/Reject even on approved events | Actions match the status: Approve is hidden once approved, Reject once rejected. |
| A fixed 1512px canvas, scaled down below that width | Real responsive layouts from 320px up. Students can browse comfortably on a phone. Below 1024px the review queue opens events on their own page. |
| 728px-tall cards in carousels with hidden scrollbars | 280px cards with **prev/next arrows**, scroll-snap and a visible scrollbar. |
| A border plus a blue glow on every card, and pills everywhere | One quiet border; a shadow only on hover for clickable cards. Pills are kept for actions and status (the tone). |
| Contrast failures (filter text `#C4C4C4`/`#898989`, placeholders, inactive tab, 12px badge) | Every text pair meets WCAG AA. Status is shown with an icon plus a word, never colour alone. |
| Two near-identical grotesques (Helvetica Neue + Neue Montreal) | **Neue Montreal only.** DM Sans survives only inside the wordmark. |
| Form fields were bare placeholder text | Labelled fields, required-field checks on blur and on submit, a segmented **Type** control, a poster drop zone, toggleable club chips, and a sticky **Submit for approval / Publish** bar. |
| A 466px footer | A compact night band with collapsible Terms & Conditions. The review workspace has no footer. |
| No hover, focus, empty or loading states | Every control has default, hover, focus, active and disabled states. Queues have empty states with a next step. |

**Removed on purpose:**
- **The filter drawer's Date/Month and time fields.** No event data supports them; they were decorative in Figma.
- **The eight identical "Pixels" club tiles.** Each club is listed once.
- **The floating round "+" button.** It's replaced by a labelled **New event** button in the header.

## Copy

Live post text is verbatim from insti.app, except for the redacted phone numbers (§ Data); Figma post copy
is verbatim from Figma. New interface text
(labels, help text, errors, empty states, button verbs) follows the system's copy rules. "Communitites"
in the nav is still kept from Figma until you decide.

## Fonts (not included)

The interface uses **Neue Montreal**, a commercial typeface. Its files are not in this repo because they
can't be redistributed. If you hold a licence, put `NeueMontreal-Regular.otf`, `NeueMontreal-Medium.otf`
and `NeueMontreal-Bold.otf` in `public/fonts/`. Without them, text falls back to Helvetica Neue (if installed) or Arial.

DM Sans (the wordmark) loads from Google Fonts. Icons are [Phosphor](https://phosphoricons.com) (MIT),
the same family as the Figma file's icons.
