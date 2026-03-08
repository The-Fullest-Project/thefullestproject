# The Fullest Project — Roadmap

## Completed

### Caregiver Gig Platform (March 2026)
- Browse/filter gig board at `/gigs/`
- Post gigs via Cloudflare Worker → auto-publish to GitHub → rebuild
- Respond to gigs via Formspree (forwards to poster's email)
- Self-service gig close (email verification) + admin close (ADMIN_KEY)
- All 50 states in location dropdowns
- Manage page at `/gigs/manage/`

### Resource Directory
- Filterable resource cards with search, location, area, and category filters
- Interactive map view (Leaflet.js) with all 50 states
- Community resource submission via Formspree
- Automated scraper pipeline (Python) with weekly GitHub Actions job

### Content
- Blog with markdown posts
- Podcast episode listings
- Therapy types guide
- Adaptive equipment guide
- IEP/504 school navigation guide
- Sensory-friendly venues (Northern Virginia)

---

## Planned

### Community Discussion Board

**Status:** Researched & designed, ready to build
**Effort:** ~1-2 weeks across 3 phases
**Cost:** $0 (Cloudflare free tier + Resend free tier)
**Full plan:** See `.claude/plans/abundant-meandering-tower.md`

#### Summary

A real-time discussion forum built on Cloudflare Workers + D1 (serverless SQLite) + Turnstile (bot protection) + Resend (email verification). Static Eleventy pages serve the shell (nav, footer, brand styles); vanilla JS fetches forum content from the Worker API.

#### Why self-built vs SaaS (Discourse, Circle)

| Factor | Self-Built (Cloudflare) | Hosted SaaS |
|--------|------------------------|-------------|
| Cost | $0/month | $240-1200/year |
| Brand consistency | Perfect match | Visual disconnect |
| Data ownership | Full (D1 database) | Vendor-controlled |
| Existing infrastructure | Extends current CF Worker pattern | New service dependency |

#### Tech Stack

- **Cloudflare Workers** — API server (auth, threads, replies, moderation)
- **Cloudflare D1** — SQLite database (users, threads, replies, votes, flags)
- **Cloudflare Turnstile** — invisible bot protection on all forms
- **Resend** — transactional email (verification, notifications)
- **Eleventy pages** — static shell at `/community/*`
- **Vanilla JS** — client-side rendering, auth via localStorage + Bearer tokens

#### Security & Spam Protection (5 layers)

1. Turnstile (invisible bot challenge)
2. Email verification required before posting
3. Trust levels (new users: limited posts/day, no links)
4. Rate limiting (1 post/60 seconds)
5. Word filter with auto-hold for moderation

#### Forum Categories

| Category | Description |
|----------|-------------|
| Introductions | Introduce yourself to the community |
| General Discussion | Open conversation about caregiving life |
| IEP & School Advocacy | IEP meetings, 504 plans, school challenges |
| Therapy & Resources | Finding and navigating therapy services |
| Adaptive Equipment | Equipment recommendations, DIY mods, reviews |
| Respite & Self-Care | Caregiver wellness, respite strategies |
| Insurance & Benefits | Navigating insurance, Medicaid, SSI, waivers |
| Northern Virginia | Local NOVA discussions, meetups, providers |
| Portland, OR | Local Portland discussions, meetups, providers |
| Wins & Celebrations | Share victories big and small |
| Ask the Community | Quick questions for fellow caregivers |

#### Implementation Phases

**Phase 1 — Foundation (MVP)**
- D1 database + schema
- Worker: auth (register, verify email, login, logout)
- Worker: thread + reply CRUD
- Turnstile + Resend integration
- Eleventy pages: forum home, category, thread, new thread, register, login, verify
- Client-side JS: API client, auth, forum rendering
- Nav + footer links

**Phase 2 — Moderation & Safety**
- Admin panel at `/community/admin/` (delete, lock, pin, ban, review queue)
- Trust levels + posting limits
- Content word filter
- Report/flag functionality
- Admin accounts for Nicole and Erin

**Phase 3 — Polish & Engagement**
- User profiles with post history
- Email notifications for thread replies (opt-in)
- Voting (upvote/downvote)
- Pagination + search
- Community guidelines page

**Phase 4 — Future Growth**
- New local categories as pilot locations expand
- Weekly digest email
- Gig board integration
- User avatars
- Private messaging

#### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Separate Worker from gig Worker | Yes | Gig uses GitHub commit pattern; forum needs real-time D1 |
| Auth mechanism | localStorage + Bearer token | Simple for cross-origin (GitHub Pages to workers.dev) |
| Post format | Plain text + auto-link URLs | Avoids XSS risk from Markdown; can add later |
| Reply nesting | 1 level max | Deeper nesting confusing on mobile |
| Password hashing | PBKDF2 via Web Crypto API | bcrypt unavailable in Workers runtime |

---

### Shop (Future)

**Status:** Coming Soon placeholder on Services page
**Details:** TBD

---

### Multi-Language Support (Future)

**Status:** Researched, not yet started
**Effort:** Phase 1 (widget) ~1 hour; Phase 2 (full i18n) ~2-3 weeks
**Cost:** $0

#### Current State

All 150-200+ UI strings are hardcoded in English across templates. No i18n infrastructure exists.

#### Recommended Approach (Two Phases)

**Phase 1 — Quick Win: Google Translate Widget**
- Drop a translate widget in the nav or footer for immediate access
- Zero site restructuring needed
- Quality is variable but provides basic access for non-English speakers
- Good stopgap while demand from specific language communities is assessed

**Phase 2 — Full i18n: Eleventy Built-in Plugin**
- Eleventy 3.x bundles an i18n plugin (no install needed)
- Directory-based locale structure: `/en/about/`, `/es/about/`, etc.
- Extract UI strings into translation JSON files (`_data/i18n/en.json`, `_data/i18n/es.json`)
- Add a `t("key")` translation lookup filter for templates
- Add language switcher UI component
- Cross-locale URL linking via `locale_url` and `locale_links` filters

#### Key Challenges

| Challenge | Notes |
|-----------|-------|
| Resource data | Scrapers pull English content; need parallel translated datasets or auto-translation |
| Blog/podcast content | User-authored; needs manual or AI-assisted translation workflow |
| Gig board | User-submitted content; hardest to translate |
| UI strings | ~150-200 strings to extract from nav, footer, forms, filters, page content |
| Scraper pipeline | Would need refactoring to support locale-aware output |

#### Alternative Considered

**eleventy-plugin-i18n (third-party)** — More turnkey string localization with a universal `i18n` filter, but adds a dependency. Could pair with or replace the built-in plugin.

---

### Location Expansion (Future)

**Status:** Architecture supports it
**Details:** Add new location JSON files to `src/_data/resources/`, new scraper modules, and new local forum categories as pilot locations are added beyond Northern Virginia and Portland.
