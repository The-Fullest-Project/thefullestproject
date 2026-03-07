# Strategy & Monetization Reference

## Contents
- Revenue Surfaces
- Services Page Conversion Architecture
- WARNING: Coming Soon Without Capture
- Coaching Funnel
- Gig Platform Pre-Launch Strategy
- Shop Pre-Launch Strategy
- Pricing Signal Patterns

## Revenue Surfaces

The site has four planned revenue streams, all at different stages:

| Revenue Stream | Status | Page | Conversion Action |
|----------------|--------|------|-------------------|
| Non-profit coaching | Active (inquiry-based) | `services/index.njk:18` | Contact form with `?subject=partnership` |
| Group life coaching | Active (inquiry-based) | `services/index.njk:35` | Contact form with `?subject=partnership` |
| Caregiver gig platform | Coming soon | `services/index.njk:52` | Email capture (`interest=gig-platform`) |
| Shop (apparel) | Coming soon | `services/index.njk:75` | Contact with `?subject=shop` |

## Services Page Conversion Architecture

The services page (`src/pages/services/index.njk`) presents all four offerings in cards:

```html
{# Non-profit coaching CTA #}
<a href="/contact/?subject=partnership" class="btn-primary">Learn More</a>

{# Group coaching CTA #}
<a href="/contact/?subject=partnership" class="btn-primary">Get Started</a>

{# Gig platform — email capture #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST">
  <input type="hidden" name="interest" value="gig-platform">
  <input type="email" name="email" placeholder="Get notified at launch" ...>
  <button type="submit" class="btn-secondary">Notify Me</button>
</form>

{# Shop CTA #}
<a href="/contact/?subject=shop" class="btn-secondary">Shop Coming Soon</a>
```

### DO: Differentiate coaching CTAs

Both coaching cards link to `/contact/?subject=partnership` with the same subject value. This makes it impossible to distinguish which service the inquiry is about.

```html
{# GOOD — use distinct subject values #}
<a href="/contact/?subject=nonprofit-coaching" class="btn-primary">Learn More</a>
<a href="/contact/?subject=group-coaching" class="btn-primary">Get Started</a>
```

Update the contact form subject dropdown to match:
```html
<option value="nonprofit-coaching">Non-Profit Coaching Inquiry</option>
<option value="group-coaching">Group Life Coaching Inquiry</option>
```

### DON'T: Use the same subject for different services

```html
{# BAD — cannot tell which service they want #}
<a href="/contact/?subject=partnership">Learn More</a>  {# coaching? gig? shop? #}
```

## WARNING: Coming Soon Without Capture

**The Problem:** The shop section links to `/contact/?subject=shop` — a general contact form. There is no dedicated email capture for shop interest, unlike the gig platform which has a proper notify form.

**Why This Breaks:**
1. Contact form is higher friction (4 fields) than a simple email capture
2. Shop-interested users are lumped with general inquiries
3. No way to blast a launch announcement to shop-interested subscribers

**The Fix:**

```html
{# Replace the shop CTA with an email capture form #}
<form action="https://formspree.io/f/{{ site.formspree.newsletter }}" method="POST"
      data-form-type="shop-notify">
  <input type="hidden" name="interest" value="shop">
  <label for="shop-email" class="sr-only">Email to get notified</label>
  <input type="email" id="shop-email" name="email"
         placeholder="Get notified when we launch" required class="form-input">
  <button type="submit" class="btn-secondary">Notify Me</button>
</form>
```

This mirrors the gig platform pattern and enables segmented launch notifications.

## Coaching Funnel

Current coaching funnel:

```
Services page → Contact form (subject=partnership) → Manual email follow-up
```

### DO: Add social proof to coaching cards

```html
{# Add to non-profit coaching card #}
<p class="text-sm text-gray-500 mt-4">
  Nicole brings 15+ years of HR and executive coaching experience.
</p>
```

The about page (`src/pages/about.njk:66-88`) has founder bios with credentials. Cross-reference these on the services page to build trust at the decision point.

### DO: Track coaching inquiry sources

```html
{# Hidden fields for attribution #}
<input type="hidden" name="_source" value="services-nonprofit-coaching">
```

Combined with the `?subject=` pre-fill, this creates a complete attribution picture.

### DON'T: Make coaching pricing a mystery

```html
{# BAD — no pricing signal at all #}
<a href="/contact/?subject=partnership" class="btn-primary">Learn More</a>
```

**Why:** "Learn More" with no pricing context attracts unqualified leads and wastes both parties' time. Add at minimum a pricing range or "starting at" signal.

## Gig Platform Pre-Launch Strategy

The gig platform email capture (`services/index.njk:65-70`) is the most forward-looking conversion event:

```html
<input type="hidden" name="interest" value="gig-platform">
```

### DO: Track gig signups separately from newsletter

Even though it uses the same Formspree endpoint, the `interest=gig-platform` field enables filtering. Ensure this field is preserved in any form refactoring.

### DO: Set launch expectations

```html
{# Add timeline or progress indicator #}
<span class="tag">Coming 2026</span>
<p class="text-sm text-gray-500">Be the first to know when we launch.</p>
```

### DON'T: Capture emails without follow-through

**Why:** Every email captured creates an implicit promise. If months pass with no updates, subscribers disengage. Plan a drip sequence. See the **designing-lifecycle-messages** skill.

## Shop Pre-Launch Strategy

The shop section (`services/index.njk:75-100`) shows three product categories (tees, mugs, prints) with a "Coming Soon" tag.

### DO: Use product previews as conversion drivers

```html
{# Show actual product mockups or concepts #}
<div class="grid grid-cols-3 gap-4 mb-6">
  <div class="card p-4 text-center">
    <p class="font-semibold">Tees & Tops</p>
  </div>
  <div class="card p-4 text-center">
    <p class="font-semibold">Mugs & Drinkware</p>
  </div>
  <div class="card p-4 text-center">
    <p class="font-semibold">Prints & Posters</p>
  </div>
</div>
```

### DON'T: Show empty categories

**Why:** Showing product categories with no products and no timeline breeds skepticism. Either show preview images or remove the categories until launch.

## Pricing Signal Patterns

For a mission-driven site, pricing requires careful framing:

### DO: Frame pricing around impact

```html
{# GOOD — ties cost to mission #}
<p class="text-gray-600">
  Group coaching sessions start at $X/month. Your participation helps fund
  free resources for caregivers nationwide.
</p>
```

### DON'T: Hide pricing entirely

**Why:** Caregivers are budget-conscious. Hidden pricing feels exclusionary and contradicts the site's accessibility mission. At minimum, show "Free" for the resource directory and "Contact for pricing" for services.

See the **structuring-offer-ladders** skill for pricing tier architecture and the **clarifying-market-fit** skill for ICP-aligned positioning.
