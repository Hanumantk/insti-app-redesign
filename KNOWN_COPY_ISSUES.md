# Known data and copy issues (redesign)

The redesign's feed combines a snapshot of the **live InstiApp feed** with the **restored Figma posts**
(see README § Data). Both are kept verbatim, apart from redacted personal phone numbers.
The issues below are in the source posts, not in this build; they're listed so you can decide whether to
keep or tidy them.

The Figma posts carry the Figma-file copy issues ("Listening Listening", "00:00 AM", four announcements
all titled "Surbahaar auditions", …). They're listed in the Figma build's [KNOWN_COPY_ISSUES.md](https://github.com/Hanumantk/insti-app-figma/blob/main/KNOWN_COPY_ISSUES.md).
"Communitites" (nav label) also appears here.

## Typos in live post titles

- `Symphpny Orientation | IMLP Session 0` — "Symphpny" → "Symphony".
- `wildlife club` — lowercase, and reads as a club name rather than an event title.

## Dates that disagree with the API

| Post | API (shown on cards) | Text inside the post |
|---|---|---|
| Inter IIT Pre-Camp Trials | Thu, 8 Oct – 8 Nov | "Date: Tuesday, 11 August 2026" |
| Battle Of the Bands 2026 \| Registration Open!! | registration 5 – 10 Oct (Deadline 10 Oct) | "Date: 27th October 2025" (likely the event date, with the wrong year) |
| Calisthenics / Zumba and Pilates | 16 Sep – 12 Oct, still **pending** review | "Starting from 16th September, 2026" — the sessions have started but the posts were never approved |

## Formatting carried over from the source

- All-caps titles: `COUNSELLING SUPPORT & EMERGENCY RESOURCES`, `REACH OUT FOR SUPPORT`.
- `Battle Of the Bands 2026 | Registration Open!!` — mixed title case, double "!!".
- `Calisthenics Sessions for Beginners and Advance` — "Advance" → "Advanced".
- Stray Markdown (`Date:**`) in the Calisthenics post; it renders as literal asterisks.
- Long raw Google Docs / WhatsApp links in descriptions (shown as clickable links).

## What the sync changed on purpose

- **Personal mobile numbers** (students, secretaries) → `[number removed]`. 14 in this snapshot.
- **Kept:** institutional emergency lines in the SWC post (IITB Hospital, QRT, 24/7 helpline).
- **Type** (event / competition / announcement) is inferred — the API has no such field. See
  `typeReason` in `src/data/live-feed.json`.
- **Midnight start times** (registrations, year-long programmes) are hidden rather than shown as "12:00 AM".
