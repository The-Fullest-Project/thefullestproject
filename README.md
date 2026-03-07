# The Fullest Project

**Living Life to the Fullest**

A connection hub for caregivers to find national and local special needs and disability information, resources, programs, education, and community.

Visit the live site: [thefullestproject.org](https://thefullestproject.org)

---

## What Is This?

The Fullest Project is a nonprofit resource directory that helps caregivers of individuals with disabilities find the support they need. The site covers all 50 US states plus DC and national resources, organized across categories like:

- Therapy and rehabilitation services
- Adaptive equipment and assistive technology
- School and IEP navigation
- Financial assistance and benefits
- Respite care and support groups
- Advocacy organizations
- And many more

## How It Works

The site is a static website built with [Eleventy](https://www.11ty.dev/) and [Tailwind CSS](https://tailwindcss.com/). Resource data is stored as JSON files and rendered into a searchable, filterable directory. A Python scraping pipeline keeps resource data current with weekly automated updates.

## For Contributors

If you know of a resource that should be listed, you can:

1. Use the [Submit a Resource](https://thefullestproject.org/submit-resource/) form on the site
2. Use the [Quick Submit bookmarklet](https://thefullestproject.org/quick-submit/) to submit resources as you browse the web

## Development

```bash
# Prerequisites: Node.js 20+
npm install
npm run dev
```

This starts the Eleventy dev server with Tailwind CSS watch mode at `http://localhost:8081`.

```bash
# Production build
npm run build
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Static Site Generator | Eleventy 3.x |
| Templating | Nunjucks |
| Styling | Tailwind CSS 4.x |
| Scraping | Python (scrapling, httpx) |
| Forms | Formspree |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

## License

ISC
