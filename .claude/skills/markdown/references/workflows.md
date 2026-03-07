# Markdown Content Workflows

## Contents
- Creating a Blog Post
- Creating a Podcast Episode
- Publishing Checklist
- Validation
- Content Categories
- Bulk Content Operations

## Creating a Blog Post

### Step-by-step

1. Create a new file in `src/blog/` with a kebab-case filename: `my-post-title.md`
2. Add required YAML front matter (layout, title, date, excerpt)
3. Write content starting with a paragraph (not a heading)
4. Use H2 for sections, H3 for subsections
5. Validate by running the dev server

```markdown
---
layout: layouts/post.njk
title: "5 Things I Wish I Knew Before Our First IEP Meeting"
date: 2026-04-15
author: "Erin & Nicole"
category: "Education"
excerpt: "Hard-won lessons from two moms who've been through dozens of IEP meetings."
tags:
  - iep
  - education
  - tips
---

Walking into your first IEP meeting can feel like stepping into
a room where everyone speaks a different language.

## 1. You Have the Right to Bring Support

You don't have to go alone. Bring a friend, family member,
or advocate. They can take notes while you focus on the
conversation.

## 2. Request the Draft IEP in Advance

Ask the school to send the draft IEP at least a week before
the meeting. Review it carefully and write down your questions.
```

### File Naming Convention

The filename becomes the URL slug. Eleventy generates the output path from the file location:

| File | Output | URL |
|------|--------|-----|
| `src/blog/welcome.md` | `_site/blog/welcome/index.html` | `/blog/welcome/` |
| `src/blog/iep-tips.md` | `_site/blog/iep-tips/index.html` | `/blog/iep-tips/` |

## Creating a Podcast Episode

### Step-by-step

1. Create a new file in `src/podcast/` with a kebab-case filename
2. Add required front matter including `episodeNumber` and `duration`
3. Write show notes with sections for topics and resources mentioned
4. Validate by running the dev server

```markdown
---
layout: layouts/post.njk
title: "Ep. 1: Why We Started The Fullest Project"
date: 2026-05-01
excerpt: "Erin and Nicole share their caregiving journeys and why they built this resource hub."
episodeNumber: 1
duration: "34 min"
tags:
  - podcast
  - founders
---

In our first episode, we share the stories that led us to
create The Fullest Project.

## What We Cover

- How each of us became caregivers
- The moment we realized resources were too scattered
- What we hope this project becomes

## Resources Mentioned

- [The Arc](https://thearc.org/) — National disability advocacy
- [Understood.org](https://understood.org/) — Learning differences support

## Transcript

**Erin:** Welcome to the very first episode of The Fullest
Project podcast...
```

## Publishing Checklist

Copy this checklist and track progress:

- [ ] Step 1: Create `.md` file in correct directory (`src/blog/` or `src/podcast/`)
- [ ] Step 2: Add all required front matter fields (layout, title, date, excerpt)
- [ ] Step 3: Verify date is YYYY-MM-DD format
- [ ] Step 4: Write excerpt as a single compelling sentence
- [ ] Step 5: Content starts with paragraph, not heading
- [ ] Step 6: All internal links use trailing slashes (`/resources/`)
- [ ] Step 7: Images have meaningful alt text
- [ ] Step 8: No skipped heading levels (H2 → H3, never H2 → H4)
- [ ] Step 9: Run dev server and verify post appears on listing page
- [ ] Step 10: Check rendered post for formatting issues

## Validation

### Dev Server Verification

1. Start the dev server: `npm run dev`
2. Verify the post appears on the listing page (`/blog/` or `/podcast/`)
3. Click through to the post and check:
   - Title renders as H1 in the header
   - Date displays correctly (e.g., "April 15, 2026")
   - Author byline appears (if provided)
   - Category tag shows on blog listing card
   - Content headings, lists, and links render properly
4. If the post does not appear, check that `date` is valid and `layout` is correct

```
1. Start dev server: npm run dev
2. Check listing page for new entry
3. If missing → verify front matter date and layout fields
4. Click post → inspect rendered HTML for heading hierarchy
5. Fix any issues and the dev server will auto-reload
```

### Common Validation Failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| Post not on listing page | Invalid `date` or wrong `layout` | Use YYYY-MM-DD and `layouts/post.njk` |
| Empty excerpt on card | Missing `excerpt` in front matter | Add `excerpt` field |
| Duplicate H1 on page | Content starts with `# Heading` | Remove the H1, start with paragraph or H2 |
| Broken internal link | Missing trailing slash | Add `/` to end of path |
| Category shows "Story" | Missing `category` in front matter | Add `category` field (blog posts only) |
| Episode shows wrong number | Missing `episodeNumber` | Add `episodeNumber` field |

## Content Categories

### Blog Post Categories

Used for the tag badge on the blog listing page. Keep consistent:

| Category | Use For |
|----------|---------|
| `Announcement` | Site updates, launches, new features |
| `Resources` | Resource roundups, guides to finding help |
| `Education` | IEP, 504, school navigation content |
| `Therapy` | Therapy types, finding providers, what to expect |
| `Community` | Caregiver stories, support network advice |
| `Equipment` | Adaptive equipment guides and reviews |

### Tags

Tags create Eleventy collections accessible via `collections.tagName`. Use lowercase kebab-case. Common tags:

```yaml
tags:
  - resources      # Resource-related content
  - therapy        # Therapy information
  - iep            # IEP/504 school topics
  - advocacy       # Rights and advocacy
  - community      # Support and connection
  - equipment      # Adaptive equipment
  - podcast        # Podcast episodes
  - announcement   # Site news
```

## Bulk Content Operations

### Finding All Posts Missing a Field

Use Grep to find posts without `excerpt`:

```bash
# Find blog posts — then check which lack excerpt
grep -rL "excerpt:" src/blog/
```

### Updating Front Matter Across Posts

When adding a new required field, check all existing posts. See the **eleventy** skill for how collections consume front matter fields and the **nunjucks** skill for how templates render them.
