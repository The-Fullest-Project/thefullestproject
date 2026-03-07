# The Fullest Project

A connection hub for caregivers of individuals with disabilities to find national and local resources, programs, education, and community. The site serves two pilot locations (Northern Virginia and Portland, OR) plus national resources, with plans to expand. Built as a static site with an automated scraping pipeline to keep resource data current.

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Static Site Generator | Eleventy (11ty) | 3.x | Generates HTML from Nunjucks/Markdown templates |
| Templating | Nunjucks (.njk) | — | Page layouts, components, and data-driven rendering |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with custom design tokens |
| Build Tool | @tailwindcss/cli | 4.x | Compiles Tailwind input CSS to output |
| Scraping | Python (scrapling, httpx) | 3.12 | Automated resource data collection |
| Forms | Formspree | — | Contact, resource submission, and newsletter forms |
| Deployment | FTP to GoDaddy | — | Static file upload to shared hosting |
| CI/CD | GitHub Actions | — | Auto-deploy on push to main; weekly scrape job |

## Quick Start

```bash
# Prerequisites: Node.js 20+, npm

# Install dependencies
npm install

# Start development server (Eleventy + Tailwind watch)
npm run dev

# Build for production
npm run build

# Deploy to GoDaddy (requires .env with FTP credentials)
npm run deploy
```

### Scraper Setup (optional)

```bash
# Prerequisites: Python 3.12+
pip install -r scrapers/requirements.txt

# Run all scrapers
python scrapers/run_all.py
```

## Project Structure

```
the-fullest-project/
├── src/                        # Eleventy source directory
│   ├── _data/                  # Global data files
│   │   ├── site.json           # Site metadata, locations, Formspree IDs
│   │   └── resources/          # Resource JSON files (nova, portland, national)
│   ├── _includes/
│   │   ├── layouts/            # Page layouts (base, page, post)
│   │   └── components/         # Reusable partials (nav, footer)
│   ├── pages/                  # Site pages (.njk)
│   │   ├── index.njk           # Homepage
│   │   ├── resources.njk       # Filterable resource directory
│   │   ├── therapy-guide/      # Therapy types reference
│   │   ├── adaptive-equipment.njk
│   │   ├── school-iep/         # IEP/504 navigation guide
│   │   ├── services/           # Coaching and gig platform info
│   │   ├── blog.njk            # Blog listing
│   │   ├── podcast.njk         # Podcast listing
│   │   ├── about.njk           # Founder bios and mission
│   │   ├── contact.njk         # Contact form
│   │   └── submit-resource.njk # Community resource submission form
│   ├── blog/                   # Blog posts (Markdown with front matter)
│   ├── podcast/                # Podcast episodes (Markdown with front matter)
│   ├── css/
│   │   └── styles.css          # Tailwind input with custom theme and components
│   ├── js/
│   │   ├── main.js             # Mobile menu toggle
│   │   └── resourceFilter.js   # Client-side search/filter for resource directory
│   ├── images/                 # Static images (passthrough copy)
│   ├── sitemap.njk             # XML sitemap generator
│   └── robots.njk              # robots.txt generator
├── scrapers/                   # Python scraping pipeline
│   ├── base_scraper.py         # Shared utilities (make_resource, save, merge)
│   ├── run_all.py              # Discovers and runs all scrapers in sources/
│   ├── requirements.txt        # Python deps (scrapling, httpx)
│   ├── sources/                # Individual scraper modules
│   │   ├── national_resources.py
│   │   ├── nova_resources.py
│   │   └── example_arc.py      # Template scraper
│   └── output/                 # Raw scraper output (JSON)
├── _site/                      # Built output (gitignored)
├── .eleventy.js                # Eleventy configuration
├── .github/workflows/
│   ├── deploy.yml              # Build + FTP deploy on push to main
│   └── scrape.yml              # Weekly scrape → commit → build → deploy
├── deploy.js                   # Manual FTP deployment script
├── package.json                # Node.js dependencies and scripts
├── .env.example                # FTP credential template
└── .gitignore
```

## Architecture Overview

The site follows a **static-site-with-data-pipeline** architecture. Eleventy reads Nunjucks templates and Markdown content from `src/`, combines them with JSON resource data from `src/_data/resources/`, and generates a fully static HTML site in `_site/`. Tailwind CSS is compiled separately via `@tailwindcss/cli`.

Resource data flows through a two-stage pipeline: Python scrapers collect and normalize resource entries into a standard JSON schema, saving to both `scrapers/output/` (raw) and `src/_data/resources/` (consumed by Eleventy). The scraper pipeline runs weekly via GitHub Actions, commits updated data, then triggers a full build and deploy.

Client-side JavaScript is minimal and vanilla — just a mobile nav toggle (`main.js`) and a resource filter/search (`resourceFilter.js`) that reads `data-*` attributes from rendered resource cards.

### Key Modules

| Module | Location | Purpose |
|--------|----------|---------|
| Eleventy Config | `.eleventy.js` | Collections (blogPosts, podcastEpisodes), filters (dateFormat, limit, filterByCategory, filterByLocation), passthrough copies |
| Site Data | `src/_data/site.json` | Global metadata: site name, URL, email, locations array, Formspree form IDs |
| Resource Data | `src/_data/resources/*.json` | Resource entries keyed by location (nova, portland, national) |
| Base Scraper | `scrapers/base_scraper.py` | `make_resource()` factory, `save_resources()`, `load_existing()`, `merge_resources()` deduplication |
| Scraper Runner | `scrapers/run_all.py` | Auto-discovers and executes all `scrape()` functions in `scrapers/sources/` |
| Resource Filter | `src/js/resourceFilter.js` | Client-side search, location filter, and category filter with URL param support |

## Development Guidelines

### File Naming
- Page files: kebab-case (`adaptive-equipment.njk`, `submit-resource.njk`)
- Subdirectory pages use `index.njk` (e.g., `pages/school-iep/index.njk`)
- JS files: camelCase (`resourceFilter.js`, `main.js`)
- Data files: kebab-case JSON (`nova.json`, `national.json`)
- Python files: snake_case (`base_scraper.py`, `run_all.py`, `nova_resources.py`)

### Code Naming
- JavaScript: camelCase variables and functions (`filterResources`, `searchInput`, `visibleCount`)
- CSS custom properties: kebab-case with category prefix (`--color-primary`, `--font-heading`)
- CSS class names: BEM-lite pattern for custom classes (`btn-primary`, `form-input`, `filter-select`, `hero-gradient`), Tailwind utilities everywhere else
- Python: snake_case functions and variables (`make_resource`, `save_resources`, `load_existing`)
- Nunjucks data: camelCase object access (`site.formspree.newsletter`, `resource.ageRange`)
- HTML IDs: kebab-case (`search-input`, `mobile-menu-btn`, `resource-grid`)

### Template Patterns
- All pages use YAML front matter: `layout`, `title`, `description`, `permalink`
- Layouts chain: content → `page.njk` or `post.njk` → `base.njk`
- Blog posts go in `src/blog/*.md` with the `post` layout
- Podcast episodes go in `src/podcast/*.md` with the `post` layout
- Components are Nunjucks partials included via `{% include "components/nav.njk" %}`
- Resource data is accessed as `resources.nova`, `resources.portland`, `resources.national` (Eleventy auto-loads `_data/resources/*.json`)

### Styling Approach
- Tailwind 4.x with `@theme` directive for custom design tokens in `src/css/styles.css`
- Brand colors: primary (teal `#2B6B4F`), secondary (amber `#E8913A`), accent (blue `#5B8DB8`)
- Fonts: Nunito (headings), Open Sans (body) via Google Fonts
- Custom component classes defined in `styles.css`: `.card`, `.tag`, `.btn-primary`, `.btn-secondary`, `.form-input`, `.filter-select`, `.hero-gradient`, `.section-warm`, `.skip-nav`
- Inline `style` attributes use CSS custom properties for theming (e.g., `style="color: var(--color-primary);"`)
- Responsive breakpoints follow Tailwind defaults: `sm:`, `md:`, `lg:`

### Accessibility
- Skip navigation link on every page
- ARIA roles on header (`banner`), nav (`navigation`), footer (`contentinfo`)
- Mobile menu uses `aria-expanded` and `aria-controls`
- Nav links use `role="menubar"` and `role="menuitem"` pattern
- Focus-visible outline style using accent color
- `aria-hidden="true"` on decorative elements
- `sr-only` labels on form inputs without visible labels

### Scraper Conventions
- Each scraper module in `scrapers/sources/` must export a `scrape()` function
- Use `make_resource()` from `base_scraper.py` for consistent data schema
- Always merge with existing data via `merge_resources()` to preserve manual entries
- Deduplication key is `(name, location)` tuple
- Scrapers save to both `scrapers/output/` and `src/_data/resources/`

### Resource Data Schema
```json
{
  "name": "Resource Name",
  "category": ["category-slug"],
  "location": "Northern Virginia | Portland | National",
  "area": "",
  "description": "What the resource does",
  "phone": "",
  "website": "https://...",
  "address": "",
  "ageRange": "",
  "disabilityTypes": [],
  "cost": "",
  "tags": ["tag1", "tag2"],
  "source": "https://...",
  "lastScraped": "2026-03-06"
}
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Eleventy dev server + Tailwind watch (concurrent) |
| `npm run build` | Full production build (Eleventy then Tailwind with minify) |
| `npm run build:11ty` | Build Eleventy only |
| `npm run build:css` | Build Tailwind CSS only (minified) |
| `npm run serve` | Eleventy dev server without Tailwind watch |
| `npm run deploy` | Full build then FTP deploy via `deploy.js` |
| `python scrapers/run_all.py` | Run all resource scrapers |

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `FTP_HOST` | For deploy | GoDaddy FTP server hostname | `ftp.thefullestproject.org` |
| `FTP_USER` | For deploy | FTP username | — |
| `FTP_PASSWORD` | For deploy | FTP password | — |
| `FTP_REMOTE_DIR` | No | Remote directory (default: `/public_html`) | `/public_html` |

Copy `.env.example` to `.env` and fill in credentials for local deploys. CI/CD uses GitHub Secrets.

## CI/CD Workflows

### Build and Deploy (`.github/workflows/deploy.yml`)
Triggers on push to `main`. Installs Node 20, runs `npm run build`, deploys `_site/` to GoDaddy via FTP.

### Weekly Scrape (`.github/workflows/scrape.yml`)
Runs every Sunday at midnight UTC (or manual trigger). Installs Python 3.12, runs all scrapers, commits updated resource data to the repo, then builds and deploys the site.

## Content Locations

| Content Type | Location | Format |
|-------------|----------|--------|
| Resource data | `src/_data/resources/*.json` | JSON arrays |
| Blog posts | `src/blog/*.md` | Markdown with YAML front matter |
| Podcast episodes | `src/podcast/*.md` | Markdown with YAML front matter |
| Static pages | `src/pages/*.njk` | Nunjucks templates |
| Site metadata | `src/_data/site.json` | JSON object |

## Third-Party Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| Formspree | Form handling (contact, resource submission, newsletter) | Form IDs in `src/_data/site.json` under `formspree` |
| Google Fonts | Nunito + Open Sans typefaces | Loaded in `base.njk` `<head>` |
| GoDaddy | Web hosting (shared, FTP-based) | FTP credentials in `.env` / GitHub Secrets |
| GitHub Actions | CI/CD for build, deploy, and weekly scraping | `.github/workflows/` |


## Skill Usage Guide

When working on tasks involving these technologies, invoke the corresponding skill:

| Skill | Invoke When |
|-------|-------------|
| eleventy | Configures Eleventy 3.x collections, filters, and static site generation from Nunjucks templates |
| frontend-design | Designs UI with Tailwind CSS custom components, brand colors, and accessible component patterns |
| tailwind | Applies Tailwind CSS 4.x utility classes, @theme custom tokens, and responsive design |
| javascript | Writes vanilla JavaScript for mobile menu toggle and client-side resource filtering |
| nunjucks | Writes and manages Nunjucks templates, layouts, components, and data-driven page rendering |
| python | Develops Python 3.12 scrapers using scrapling and httpx for resource data collection |
| json | Structures resource data, site metadata, and scraper output in JSON format |
| ftp | Deploys static site to GoDaddy via FTP using Node.js deployment script |
| github-actions | Configures CI/CD workflows for automated build, deploy, and weekly scraping jobs |
| markdown | Authors blog posts and podcast episodes with YAML front matter and markdown content |
| mapping-user-journeys | Maps in-app journeys and identifies friction points in code |
| scoping-feature-work | Breaks features into MVP slices and acceptance criteria |
| instrumenting-product-metrics | Defines product events, funnels, and activation metrics |
| designing-onboarding-paths | Designs onboarding paths, checklists, and first-run UI |
| orchestrating-feature-adoption | Plans feature discovery, nudges, and adoption flows |
| structuring-offer-ladders | Frames plan tiers, value ladders, and upgrade logic |
| designing-inapp-guidance | Builds tooltips, tours, and contextual guidance |
| crafting-page-messaging | Writes conversion-focused messaging for pages and key CTAs |
| tightening-brand-voice | Refines copy for clarity, tone, and consistency |
| clarifying-market-fit | Aligns ICP, positioning, and value narrative for on-page messaging |
| triaging-user-feedback | Routes feedback into backlog and quick wins |
| designing-lifecycle-messages | Designs onboarding and lifecycle email sequences |
| tuning-landing-journeys | Improves landing page flow, hierarchy, and conversion paths |
| mapping-conversion-events | Defines funnel events, tracking, and success signals |
| inspecting-search-coverage | Audits technical and on-page search coverage |
| adding-structured-signals | Adds structured data for rich results |
