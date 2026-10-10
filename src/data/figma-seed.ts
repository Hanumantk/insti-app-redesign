import { A } from '../lib/assets'
import type { Club, HistoryEntry, InstiEvent } from './types'

// The Figma file's mock posts (restored alongside the live feed). Copy is verbatim from Figma,
// typos and trailing spaces included
// (see KNOWN_COPY_ISSUES.md). Nothing here is invented.

export const FIGMA_CLUBS: Record<string, Club> = {
  culturals: { id: 'culturals', name: 'Culturals@IITB', tagline: 'To life. To surprises. To discovery', logo: A.clubCulturals },
  pixels: { id: 'pixels', name: 'Pixels ', tagline: 'Photography club', logo: A.clubPixels },
  rang: { id: 'rang', name: 'Rang ', tagline: 'Fine arts club', logo: A.clubRang },
}


export const REJECTION_COPY =
  'In this field there will be a comment of reason why this event got rejected posted by GSSA. The event creator can edit the event and resend it for approval.'

const PEER_DESCRIPTION =
  'Peer Connect is an SWC initiative designed for PhD students. It offers a safe, welcoming, and non-judgmental space where you can simply show up to talk, listen, or just be. These informal group sessions, facilitated by SWC’s student counsellors, are a chance to share what’s on your mind, hear others’ experiences, and feel a sense of connection. There’s no pressure to fix or solve anything. It’s simply a space for empathy, understanding, and real conversations.'

const PEER_MORE_DETAILS = [
  'SWC invites PhD Students to Peer Connect: A Listening Listening Circle',
  'The goal is to build a supportive campus community where talking about mental health feels normal, human, and okay.',
  '',
  '**PS:** Seats are limited to 30 students per batch. Once the batch is full, registrations will be closed.',
  '',
  '**Note:** The themes are only meant to guide the conversations in the circle. Even if a theme doesn’t fully resonate with your own experience, your presence still matters. There will also be space for open, free-flowing conversations. The aim is simple: to create a safe space where we can talk, listen, and feel understood.',
].join('\n')

const PEER_REGARDS = 'Thanks and Regards\nToyaj Kabi\nInstitute Photography & Fine Arts Secretary\n[number removed]'
const PEER_MORE_REGARDS =
  'With Unwavering Spirit, Reigniting Our Cultural Flame.\nBest Regards,\nAditya Sisodiya\nGeneral Secretary, Cultural Affairs\nIIT Bombay\n[number removed]'

const CURIOUS_HERO =
  'As part of the Curious Community, we invite you to MetaMorph - where crazy ideas, research labs, and superpowers collide. From the silver screen to the laboratory, can you engineer reality out of fiction? What’s in it for you? -> Decode sci-fi tech into real-world '
const CURIOUS_CARD = 'As part of the Curious Community, we invite you to MetaMorph - where crazy '
const LITERARIUM_CARD =
  'Literarium is our very own flagship event, and is the biggest celebration of the diverse community in Literati. As organisers in Literarium, you would be the heart and soul of the festival, and we are incredibly '
const PEER_CARD =
  'Peer Connect is an SWC initiative designed for PhD students. It offers a safe, welcoming, and non-judgmental space where you '
const PIT_CARD =
  'This is a Market Making competition designed for you to step into the pit and explore exactly how trades are '
const AIML_CARD =
  'We’re excited to announce the AI-ML GC 2025–26, a 3-week AI/ML development hackathon conducted in collaboration '
const AZEO_CARD =
  'We are pleased to announce Chempreneur, a national-level competition designed to foster the entrepreneurial mindset among '
const SURBAHAAR =
  'Greetings from Symphony!\nMissed surbahaar auditions? Don’t worry, we are conducting Vocal auditions again and Online submissions for the instrumentalists.'

// Seeded review trail: the order of steps is implied by each card's status in 41:211.
const SUB: HistoryEntry = { kind: 'submitted', by: 'gsha' }
const OK: HistoryEntry = { kind: 'approved', by: 'gsec' }

const base = { interested: 0, going: 0, clubs: [] as string[], status: 'approved' as const, createdBy: 'others' as const, placement: 'feed' as const }

let t = 1_700_000_000_000
const at = () => (t -= 1000)

export function buildFigmaSeed(): InstiEvent[] {
  t = 1_700_000_000_000
  return [
    // ---- Feed: Events row (75:402) ----
    {
      ...base, id: 'literarium', type: 'event', createdAt: at(),
      title: 'Literarium All Team Meet', description: LITERARIUM_CARD.trim(), cardBlurb: LITERARIUM_CARD,
      date: 'Sun, 18 Jan ', time: '7:00 PM', venue: 'Theatre Room, Old SAC',
      cardPoster: A.cardLiterarium, statusPoster: A.scLiterarium, detailPoster: A.posterLiterarium,
    },
    {
      ...base, id: 'peer-connect', type: 'event', createdAt: at(),
      title: 'Peer Connect: A Listening Listening Circle for PhD', description: PEER_DESCRIPTION, cardBlurb: PEER_CARD,
      moreDetails: PEER_MORE_DETAILS, contact: 'Piyush Fitness Club Manager M: [number removed]',
      regards: PEER_REGARDS, moreRegards: PEER_MORE_REGARDS, instagram: '', website: '',
      date: 'Wed, 21 Jan ', time: '6:00 PM', venue: 'Music Room H-8',
      cardPoster: A.cardPeerConnect, statusPoster: A.scPeerConnect, detailPoster: A.posterPeerConnect,
      clubs: ['culturals', 'pixels', 'rang'], interested: 9, going: 0,
    },
    {
      ...base, id: 'pit-trading', type: 'event', createdAt: at(),
      title: 'Pit Trading Challenge - Quant Community × IMC', description: PIT_CARD.trim(), cardBlurb: PIT_CARD,
      date: 'Wed, 21 Jan ', time: '5:30 PM', venue: 'LA 002',
      cardPoster: A.cardItc, statusPoster: A.scItc,
    },
    {
      ...base, id: 'curious-community', type: 'event', recommended: true, createdAt: at(),
      title: 'Curious Community: MetaMorph | EnPoWER, UGAC', description: CURIOUS_HERO.trim(),
      cardBlurb: CURIOUS_CARD, heroBlurb: CURIOUS_HERO,
      date: 'Wed, 21 Jan ', time: '9:00 PM', venue: 'LA 002',
      cardPoster: A.cardCurious, heroPoster: A.heroCurious,
    },
    // ---- Feed: Competitions row (75:490) ----
    {
      ...base, id: 'aiml-gc', type: 'competition', createdAt: at(),
      title: 'AI-ML GC 2025-26 | Web and Coding Club', description: AIML_CARD.trim(), cardBlurb: AIML_CARD,
      date: '', deadline: 'Deadline 22 Jan', time: '12:00 AM', venue: 'Lecture hall complex',
      cardPoster: A.cardAiml, statusPoster: A.scAiml,
    },
    {
      ...base, id: 'azeotropy', type: 'competition', createdAt: at(),
      title: 'Register Now - National Competition | AZeotropy', description: AZEO_CARD.trim(), cardBlurb: AZEO_CARD,
      date: '', deadline: 'Deadline 15 Jan', time: '00:00 AM', venue: 'Online',
      cardPoster: A.cardAzeotropy, statusPoster: A.scAzeotropy,
    },
    {
      ...base, id: 'pit-trading-comp', type: 'competition', createdAt: at(),
      title: 'Pit Trading Challenge - Quant Community × IMC', description: PIT_CARD.trim(), cardBlurb: PIT_CARD,
      date: 'Wed, 21 Jan ', time: '5:30 PM', venue: 'LA 002',
      cardPoster: A.cardItc, statusPoster: A.scItc,
    },
    {
      ...base, id: 'curious-community-comp', type: 'competition', createdAt: at(),
      title: 'Curious Community: MetaMorph | EnPoWER, UGAC', description: CURIOUS_HERO.trim(), cardBlurb: CURIOUS_CARD,
      date: 'Wed, 21 Jan ', time: '9:00 PM', venue: 'LA 002',
      cardPoster: A.cardCurious, heroPoster: A.heroCurious,
    },
    // ---- Feed: Announcements drawer (110:2365) ----
    ...[A.annSurbahaar, A.annCricket, A.annBadminton, A.posterLiterarium].map((poster, i) => ({
      ...base, id: `announcement-${i + 1}`, type: 'announcement' as const, createdAt: at(),
      title: 'Surbahaar auditions', description: SURBAHAAR,
      date: 'Wed, 21 Jan ', time: '9:00 PM', venue: 'Conference room, Old SAC',
      detailPoster: poster,
    })),
    // ---- GSHA submissions, statuses from 41:211 (card copy is as shown there) ----
    {
      ...base, id: 'sub-peer-connect', feedRef: 'peer-connect', placement: 'submission', createdBy: 'gsha', type: 'event', createdAt: at(),
      title: 'Peer Connect: A Listening Listening Circle for PhD', description: PEER_DESCRIPTION, cardBlurb: PEER_CARD,
      moreDetails: PEER_MORE_DETAILS, contact: 'Piyush Fitness Club Manager M: [number removed]',
      regards: PEER_REGARDS, moreRegards: PEER_MORE_REGARDS, instagram: '', website: '',
      date: 'Wed, 21 Jan ', time: '6:00 PM', venue: 'Music Room H-8',
      cardPoster: A.cardPeerConnect, statusPoster: A.scPeerConnect, detailPoster: A.posterPeerConnect,
      clubs: ['culturals', 'pixels', 'rang'], interested: 9, going: 0, status: 'approved', history: [SUB, OK],
    },
    {
      ...base, id: 'sub-pit-trading', feedRef: 'pit-trading', placement: 'submission', createdBy: 'gsha', type: 'event', createdAt: at(),
      title: 'Pit Trading Challenge - Quant Community × IMC', description: PIT_CARD.trim(), cardBlurb: PIT_CARD,
      date: 'Wed, 21 Jan ', time: '6:00 PM', venue: 'Music Room H-8',
      cardPoster: A.cardItc, statusPoster: A.scItc,
      status: 'rejected', rejectionComment: REJECTION_COPY, history: [SUB, { kind: 'rejected', by: 'gsec', comment: REJECTION_COPY }],
    },
    {
      ...base, id: 'sub-literarium', feedRef: 'literarium', placement: 'submission', createdBy: 'gsha', type: 'event', createdAt: at(),
      title: 'Literarium All Team Meet', description: LITERARIUM_CARD.trim(), cardBlurb: LITERARIUM_CARD,
      date: 'Wed, 21 Jan ', time: '6:00 PM', venue: 'Music Room H-8',
      cardPoster: A.cardLiterarium, statusPoster: A.scLiterarium, detailPoster: A.posterLiterarium,
      status: 'approved', history: [SUB, OK],
    },
    {
      ...base, id: 'sub-azeotropy', feedRef: 'azeotropy', placement: 'submission', createdBy: 'gsha', type: 'competition', createdAt: at(),
      title: 'Register Now - National Competition | AZeotropy', description: AZEO_CARD.trim(), cardBlurb: AZEO_CARD,
      date: 'Wed, 21 Jan ', deadline: 'Deadline 21 Jan ', time: '6:00 PM', venue: 'Music Room H-8',
      cardPoster: A.cardAzeotropy, statusPoster: A.scAzeotropy,
      status: 'pending', history: [SUB],
    },
    {
      ...base, id: 'sub-aiml', feedRef: 'aiml-gc', placement: 'submission', createdBy: 'gsha', type: 'competition', createdAt: at(),
      title: 'AI-ML GC 2025-26 | Web and Coding Club', description: AIML_CARD.trim(), cardBlurb: AIML_CARD,
      date: 'Wed, 21 Jan ', time: '6:00 PM', venue: 'Music Room H-8',
      cardPoster: A.cardAiml, statusPoster: A.scAiml,
      status: 'rejected', history: [SUB, { kind: 'rejected', by: 'gsec' }],
    },
  ]
}
