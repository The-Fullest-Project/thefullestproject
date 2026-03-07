# Measurement & Testing Reference

## Contents
- Current Measurement Capabilities
- WARNING: No Analytics Installed
- Formspree as Proxy Analytics
- Client-Side Event Hooks
- Testing Page Changes
- Measurement Implementation Checklist

## Current Measurement Capabilities

This is a static site deployed to GoDaddy shared hosting via FTP. There is **no analytics SDK**, no event tracking, no A/B testing framework, and no server-side logging accessible to the team.

The only measurable signals today:
1. **Formspree submission counts** — visible in Formspree dashboard per form
2. **GoDaddy hosting logs** — basic server access logs (if enabled)
3. **Manual observation** — checking form submissions in email

## WARNING: No Analytics Installed

**The Problem:** The site has zero visibility into visitor behavior. You cannot measure:
- Page views or session duration
- Which CTAs get clicked
- Where visitors drop off
- Which resource categories are most searched
- Whether pre-filtered links from educational pages convert

**Impact:** Every landing page change is a guess. You cannot validate whether a new section order, CTA change, or copy revision actually improves outcomes.

**Recommended Solution — Privacy-Friendly Analytics:**

```njk
{# Add to src/_includes/layouts/base.njk before </head> #}
{# Option 1: Plausible (privacy-friendly, no cookies, GDPR-compliant) #}
<script defer data-domain="thefullestproject.org" src="https://plausible.io/js/script.js"></script>

{# Option 2: Fathom (similar privacy stance) #}
<script src="https://cdn.usefathom.com/script.js" data-site="YOUR_SITE_ID" defer></script>
```

**Why Plausible/Fathom over Google Analytics:** No cookie banners needed, no GDPR consent flow, simpler setup, and the audience (caregivers) deserves privacy respect.

See the **mapping-conversion-events** skill for event taxonomy design.

## Formspree as Proxy Analytics

Until proper analytics is installed, Formspree submissions are the only conversion signal. Track these manually:

| Form | Formspree ID | What It Tells You |
|------|-------------|-------------------|
| Newsletter | `site.formspree.newsletter` | Email capture rate, interest level |
| Contact | `site.formspree.contact` | Subject distribution reveals user intent |
| Submit Resource | `site.formspree.submitResource` | Community engagement signal |

### Segmenting Newsletter Signups

The services page adds a hidden field to distinguish gig-platform interest:

```njk
{# src/pages/services/index.njk — gig platform signup #}
<input type="hidden" name="interest" value="gig-platform">
```

Extend this pattern to track which page drove the signup:

```njk
{# Add to every newsletter form #}
<input type="hidden" name="_source" value="{{ page.url }}">
```

This lets you see in Formspree whether homepage signups outperform footer signups.

See the **triaging-user-feedback** skill for processing Formspree submissions.
See the **instrumenting-product-metrics** skill for metric taxonomy.

## Client-Side Event Hooks

Without an analytics SDK, you can still instrument events for future use. Add data attributes that an analytics script can read:

```njk
{# Pattern: data-track attributes on CTAs #}
<a href="/resources/"
   class="btn-secondary"
   data-track="hero-cta-find-resources">
  Find Resources
</a>

<a href="/resources/?category=therapy"
   class="btn-primary"
   data-track="therapy-guide-browse-cta">
  Browse Therapy Providers
</a>
```

When analytics is added, a single listener captures all events:

```javascript
// Future: src/js/analytics.js
document.querySelectorAll('[data-track]').forEach(el => {
  el.addEventListener('click', () => {
    // plausible('CTA Click', { props: { name: el.dataset.track } });
    // or: fathom.trackEvent(el.dataset.track);
  });
});
```

### Resource Filter Usage Tracking

`resourceFilter.js` already tracks which filters are active. Add a hook for future analytics:

```javascript
// Add to filterResources() in src/js/resourceFilter.js
function filterResources() {
  // ... existing filter logic ...

  // Future analytics hook
  if (window.plausible) {
    plausible('Resource Filter', {
      props: {
        search: searchInput.value ? 'yes' : 'no',
        location: locationFilter.value || 'all',
        category: categoryFilter.value || 'all',
        resultCount: visibleCount
      }
    });
  }
}
```

## Testing Page Changes

Without A/B testing infrastructure, use a before/after approach with Formspree data:

### Manual Before/After Testing

1. Note current weekly Formspree submission count for the form you're optimizing
2. Make ONE change (CTA copy, section order, etc.)
3. Deploy via `npm run deploy`
4. Wait 2 full weeks for comparable data
5. Compare submission counts

**Critical:** Change only ONE variable at a time. If you move a CTA AND change its copy simultaneously, you cannot attribute any change.

### Local Visual Testing

```bash
npm run dev
```

Check every page at three viewport widths:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1280px (standard laptop)

### Validation Loop

1. Edit template in `src/pages/`
2. Run `npm run dev`
3. Check hero CTA visibility at all three breakpoints
4. Verify pre-filtered links work (`?category=` and `?location=`)
5. Submit test form to Formspree (use a test form ID)
6. If any check fails, fix and repeat from step 2
7. Only deploy when all checks pass

## Measurement Implementation Checklist

- [ ] Add `data-track` attributes to all primary and secondary CTAs
- [ ] Add `_source` hidden field to all newsletter forms
- [ ] Install Plausible or Fathom analytics in `base.njk`
- [ ] Configure custom events for CTA clicks and form submissions
- [ ] Set up Formspree email notifications for submission monitoring
- [ ] Document baseline Formspree counts before making changes
