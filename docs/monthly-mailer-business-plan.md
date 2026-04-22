# The Fullest Project — Monthly Mailer Business Plan

## Concept

A physical monthly subscription mailer inspired by [The Tiny Farmers Market](https://www.thetinyfarmersmarket.com). Each envelope contains a commissioned piece of art (card, postcard, bookmark print) created by a disability artist, a personal letter from the artist about what "living life to the fullest" means to them, plus bonus items like stickers, recipes, or affirmation cards. Everything fits in a single standard envelope requiring only one stamp.

## Value Proposition

**For subscribers:** A monthly moment of connection, inspiration, and tangible beauty from artists with disabilities — delivered to your mailbox. Not another digital notification, but something you can hold, hang on your fridge, or give to a friend.

**For artists:** Paid commissions, exposure, and a platform to share their perspective with a caring audience.

**For the mission:** A sustainable revenue stream that directly supports disability artists while building community among caregivers.

---

## Pricing Strategy

| Tier | Monthly Price | Includes | Margin Target |
|------|--------------|----------|---------------|
| **Standard** | $9.99/mo | 1 art piece + artist letter + 1 bonus item | 55-60% |
| **Supporter** | $14.99/mo | Standard + extra art print + recognition on site | 60-65% |
| **Gift (3-month)** | $27.99 prepaid | 3 months of Standard, shipped monthly | 50-55% |
| **Gift (12-month)** | $99.99 prepaid | 12 months of Standard | 55-60% |

### Cost Breakdown (Standard tier)

| Item | Est. Cost |
|------|-----------|
| Art commission (per subscriber print) | $0.50-1.00 (bulk printing from original) |
| Artist fee (flat per month) | $200-500 per artist |
| Envelope + stamp | $0.85 (Forever stamp + #10 envelope) |
| Bonus item (sticker, bookmark) | $0.15-0.30 |
| Printing (card/postcard, letter) | $0.40-0.60 |
| Packing materials & labor | $0.50-1.00 |
| **Total COGS per unit** | **$2.40-3.75** |
| **Gross margin at $9.99** | **$6.24-7.59 (62-76%)** |

**Break-even:** Artist fee of $350/month ÷ $6.50 avg margin = ~54 subscribers to break even on artist costs. With 100 subscribers, net ~$300/month after artist fees. At 500 subscribers, net ~$2,900/month.

---

## Subscriber Acquisition

### On-Site (thefullestproject.org)

1. **Dedicated landing page** at `/mailer/` with:
   - Hero image of the mailer contents (flatlay photo)
   - Artist spotlight video/bio
   - "What's Inside" unboxing section
   - Subscription tiers + sign-up form
   - Testimonials (add as they come in)

2. **Site-wide CTA** — add banner/card on homepage, resources page, and footer:
   > "Get monthly art from disability artists delivered to your mailbox. [Subscribe →](/mailer/)"

3. **Newsletter footer** — existing email subscribers get a "Upgrade to physical mailer" CTA

4. **Blog/article tie-in** — feature the monthly artist in a blog post with behind-the-scenes content

### Off-Site Growth

| Channel | Tactic |
|---------|--------|
| Instagram | Monthly "unboxing" Reel showing the mailer, tag the artist |
| Facebook Groups | Share in caregiver/disability parent groups (with admin permission) |
| Podcast mentions | Feature on Once Upon a Gene, Parenting Impossible — offer promo code |
| Disability events | Table at Abilities Expo with sample mailers as giveaway |
| Referral program | "Give a friend 1 free month, get 1 free month" |
| Launch special | First 50 subscribers get a bonus signed art print |

### Retention

- **Variety:** Rotate art styles monthly (watercolor, digital, photography, textile)
- **Community:** Subscriber-only Discord/Facebook group
- **Agency:** Quarterly survey: "Vote for next month's theme"
- **Surprise:** Random months include an extra item (mini zine, seed packet, tea bag)

---

## Assembly Process

### Monthly Timeline

| Week | Activity |
|------|----------|
| Week 1 | Commission artist: agree on theme, deadline, and fee |
| Week 2 | Receive digital artwork; send to printer; artist writes letter |
| Week 3 | Receive printed materials; assemble + stuff envelopes |
| Week 4 | Mail all envelopes (USPS bulk or hand-mail if <100) |

### Assembly Workflow (for 50-200 subscribers)

1. **Print:** Use a local print shop or online service (Moo, Vistaprint, PrintingForLess) for postcards/cards. Letter printed in-house on branded letterhead.
2. **Stuff:** Assembly party approach — set up stations:
   - Station 1: Insert art piece (card/postcard)
   - Station 2: Insert artist letter (folded)
   - Station 3: Insert bonus item (sticker, bookmark)
   - Station 4: Seal, stamp, address label
3. **Address labels:** Export subscriber list → mail merge → print labels (Avery 5160 or similar)
4. **Mail:** Drop at USPS. Under 100 pieces: just stamp and go. Over 200: consider USPS Marketing Mail (bulk rate ~$0.45 vs. $0.73 Forever stamp) — requires a permit.

### Scaling (200+ subscribers)

- **Fulfillment service:** Consider print-and-mail services like [Lob](https://www.lob.com/) or [Stannp](https://www.stannp.com/) that handle printing, stuffing, and mailing via API. Upload artwork + subscriber list → they do the rest.
- **Subscription management:** Use [Stripe](https://stripe.com/) or [Shopify Subscriptions](https://www.shopify.com/) for recurring billing — integrates with address management.
- **Inventory:** Keep 1 month buffer of printed materials; order 2 weeks before assembly.

---

## Bonus Item Ideas

| Item | Cost | Notes |
|------|------|-------|
| Vinyl sticker (2-3") | $0.10-0.20 | Custom art from the month's artist |
| Bookmark | $0.15-0.25 | Double-sided with art + quote |
| Recipe card | $0.10 | Seasonal recipes, easy to print |
| Affirmation card | $0.10 | "You're doing an incredible job" — caregiver encouragement |
| Tea bag (single serve) | $0.15-0.25 | "Take a moment for yourself" theme |
| Seed packet | $0.20-0.30 | Seasonal — spring/summer months |
| Mini coloring page | $0.05 | From the artist's original work |
| QR code to exclusive content | $0.00 | Behind-the-scenes video, artist interview |

**Rule:** Keep total weight under 1 oz (single stamp territory). Flat items only — no bulges that require non-machinable surcharge ($0.46 extra).

---

## Payment & Subscription Platform

**Recommended: Stripe + simple website form**

1. Create Stripe product with monthly recurring price
2. Embed Stripe checkout on `/mailer/` page
3. Stripe handles: recurring billing, card updates, cancellations, receipts
4. Export subscriber addresses monthly for assembly
5. Cost: 2.9% + $0.30 per transaction (~$0.59 on a $9.99 charge)

**Alternative: Shopify**
- Better for gift subscriptions and one-time purchases
- Higher monthly cost ($39/mo + transaction fees)
- Better admin UI for managing subscribers/shipments
- Worth it at 200+ subscribers

---

## Launch Roadmap

| Phase | Timeline | Goal |
|-------|----------|------|
| **Pilot** | Month 1-2 | Commission first artist, create sample mailer, photograph it, build `/mailer/` landing page |
| **Soft launch** | Month 3 | Open to existing newsletter subscribers (target: 25 sign-ups) |
| **Public launch** | Month 4 | Instagram unboxing video, blog feature, site-wide CTA (target: 50) |
| **Growth** | Month 5-8 | Referral program, podcast mentions, event presence (target: 100-200) |
| **Scale** | Month 9+ | Evaluate fulfillment service, add Supporter tier, explore corporate gifting |

---

## Artist Partnership Model

- **Fee:** $200-500 per commission (flat, not per-subscriber)
- **Rights:** Artist retains copyright; The Fullest Project gets print + digital distribution license for the subscription
- **Exposure:** Artist bio + photo on site, social media feature, link to their shop/portfolio
- **Selection:** Prioritize artists with disabilities; rotate monthly; build roster of 12+ artists for annual variety
- **Pipeline:** Reach out to Art Enables (DC), ArtXV, disability artist Instagram accounts, VSA (Very Special Arts), Disability Arts Online

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Low initial sign-ups | Pilot with existing community; don't commit to large print runs until 25+ confirmed |
| Artist no-shows | Maintain 2-month artist backlog; have a backup piece ready |
| Postal delays | Mail 5 business days before month-end; track first 10 shipments each month |
| Churn | Survey cancelers; send "we miss you" reactivation offer at 30/60/90 days |
| Scope creep | Keep it simple: one stamp, one envelope, 2-3 items. Resist adding complexity. |
