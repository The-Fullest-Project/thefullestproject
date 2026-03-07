# Strategy & Monetization Reference

## Contents
- Revenue-Adjacent Lifecycle Sequences
- Service Promotion via Email
- WARNING: No Payment Infrastructure
- Gig Platform Launch Strategy
- Coaching Funnel via Lifecycle Email
- Newsletter as Revenue Foundation

---

## Revenue-Adjacent Lifecycle Sequences

The Fullest Project has three revenue paths visible in the codebase. Lifecycle emails should nurture subscribers toward these without being salesy.

### Current Revenue Paths

```njk
{# src/pages/services/index.njk — three service cards #}

{# 1. Non-Profit Coaching #}
<a href="/contact/?subject=partnership" class="btn-primary">Learn More</a>

{# 2. Group Life Coaching #}
<a href="/contact/?subject=partnership" class="btn-primary">Get Started</a>

{# 3. Caregiver Gig Platform (Coming Soon) #}
<input type="hidden" name="interest" value="gig-platform">
<button type="submit">Notify Me</button>
```

### Lifecycle Sequence → Revenue Mapping

| Sequence | Revenue Path | Approach |
|----------|-------------|----------|
| Welcome (Day 7) | Services awareness | Soft mention of coaching in "Community" email |
| Post-onboarding (Day 14+) | Coaching inquiry | Feature story of coaching success |
| Gig platform launch | Platform adoption | Dedicated launch sequence |
| Monthly newsletter | Shop (coming soon) | Curated product recommendations |

---

## Service Promotion via Email

### DO: Lead with Value, Then Mention Services

```markdown
# GOOD — value-first approach
Subject: "Navigating the system doesn't have to be lonely"
Body:
"Last month, 3 families in our coaching program found IEP advocates
through our resource directory. One parent told us: 'I finally felt
like someone was in my corner.'

If you're feeling overwhelmed by the process, our group coaching
sessions bring caregivers together to share strategies and support.

→ Learn more about coaching: /services/
→ Or browse IEP resources: /resources/?category=legal"
```

```markdown
# BAD — sales-first approach
Subject: "Sign up for our coaching program!"
Body:
"Our coaching program is now available! Sign up today for group
sessions with expert coaches. Limited spots available!

→ Sign up now: /contact/?subject=partnership"
```

**Why:** Caregivers are exhausted and suspicious of being sold to. Every monetization touchpoint must deliver value first. The coaching offer should feel like a natural extension of the help you've already provided.

### DON'T: Promote Services in the Welcome Sequence

The first 7 days are about building trust and demonstrating value. NEVER include a services pitch in the welcome drip.

```markdown
# Welcome sequence email topics:
Day 0: Welcome + resources link          ✓ Pure value
Day 3: Guide content + depth             ✓ Pure value
Day 7: Community + submit resource        ✓ Community building
Day 7: "Also check out our coaching!"     ✗ TOO EARLY
```

Services enter the conversation at Day 14+ when the subscriber has engaged with content and recognizes the brand's credibility.

---

## WARNING: No Payment Infrastructure

**Detected:** No payment processing (Stripe, PayPal, Square) in dependencies. No pricing pages. Services route to the contact form.

**Impact:**
1. Cannot convert email interest into direct revenue
2. Coaching inquiries go to a general contact form with no tracking
3. No way to measure email → revenue attribution
4. "Shop" section on services page says "Coming Soon" with no infrastructure

### Current Contact-Based Funnel

```
Lifecycle email → "Learn about coaching" CTA
  → /contact/?subject=partnership
    → Formspree contact form
      → Manual follow-up by founders
```

This works at low volume. For scaling, consider:

```markdown
## Future Payment Integration Options
| Tool | Use Case | Integration Path |
|------|----------|-----------------|
| Stripe Payment Links | Coaching session booking | Link in email, no code changes |
| Calendly | Coaching discovery call scheduling | Link in email + embed on /services/ |
| Gumroad/Lemon Squeezy | Digital products (guides, templates) | Link in email |
```

Stripe Payment Links require zero code changes — just include the payment URL in lifecycle emails.

---

## Gig Platform Launch Strategy

The gig platform has its own signup form with the `interest=gig-platform` hidden field. This is the most direct revenue path. The launch sequence must convert interest into early adopters.

### Pre-Launch Sequence

```markdown
## Gig Platform Interest Sequence

**Trigger:** Formspree webhook with interest=gig-platform

### Email 1 — Day 0: Confirmation
Subject: "You're on the list"
Body:
- Confirm they'll be notified at launch
- Explain what the gig platform is (connect caregivers with flexible work)
- Link to /services/ for more context
- "In the meantime, browse our resource directory: /resources/"

### Email 2 — Pre-Launch (Manual Trigger)
Subject: "The gig platform launches next week"
Body:
- Date announcement
- What to expect (features, how it works)
- Early access CTA: "Get early access" → landing page
- Share with other caregivers

### Email 3 — Launch Day (Manual Trigger)
Subject: "The Caregiver Gig Platform is live"
Body:
- Platform is live
- How to sign up
- First 50 users get [incentive]
- CTA: "Create Your Profile" → platform URL
```

### Post-Launch Nurture

```markdown
## After Launch — Drip for Non-Converters
Day 3 post-launch: "Here's what caregivers are saying"
Day 7 post-launch: "Your profile takes 5 minutes to set up"
Day 14 post-launch: Final reminder or move to general newsletter
```

---

## Coaching Funnel via Lifecycle Email

### The Funnel

```
Resource browser → Newsletter subscriber → Content engaged
  → Coaching mention in email (Day 14+)
    → /services/ page visit
      → /contact/?subject=partnership form submit
        → Manual outreach by founders
```

### Email Touchpoints for Coaching

```markdown
## Email Content That Naturally Leads to Coaching

Topic: "How to prepare for your child's IEP meeting"
Natural bridge: "Some families find it helpful to work with a coach
who knows the system. Our group coaching connects you with other
caregivers and an experienced advocate."
CTA: "Learn About Group Coaching" → /services/

Topic: "Navigating insurance for therapy coverage"
Natural bridge: "If you're struggling with insurance denials, our
non-profit coaching program can help you build an appeal strategy."
CTA: "Explore Coaching Options" → /services/
```

### DO: Use Contact Form Subject Pre-Fill

The services page CTAs already use subject pre-fill. Email CTAs should do the same:

```markdown
# In email:
[Learn About Coaching](/contact/?subject=partnership)

# This pre-selects "Partnership Opportunity" in the contact form dropdown
# Making it easier for the founders to triage coaching inquiries
```

---

## Newsletter as Revenue Foundation

The newsletter subscriber list is the foundation of all monetization. Every subscriber represents a potential coaching client, gig platform user, or shop customer.

### Subscriber Value Stages

```markdown
Stage 1: Subscriber (value: $0 — just signed up)
Stage 2: Engaged (value: low — opens emails, clicks links)
Stage 3: Active (value: medium — visits site regularly, submits resources)
Stage 4: Customer (value: high — coaching client or platform user)
Stage 5: Advocate (value: highest — refers other caregivers)
```

### Lifecycle Emails Move Subscribers Through Stages

| Stage Transition | Lifecycle Trigger | Email Content |
|-----------------|-------------------|---------------|
| 1 → 2 | Welcome sequence completion | Drip emails with valuable content |
| 2 → 3 | First resource submission or blog comment | "Thank you" + deeper engagement invite |
| 3 → 4 | Services interest signal (clicked coaching link) | Coaching testimonial + scheduling CTA |
| 4 → 5 | Post-purchase/session follow-up | "Share with a caregiver who needs this" |

### Monthly Revenue-Aware Newsletter Template

```markdown
## Monthly Newsletter Structure

1. **Value section** (80% of email)
   - New resources added this month (from scraper pipeline)
   - Featured blog post or guide
   - Community highlight (resource submission story)

2. **Soft monetization** (20% of email)
   - Coaching spotlight: brief testimonial or session recap
   - Gig platform update (if launched) or "coming soon" tease
   - Shop feature (when available)

3. **Community CTA**
   - "Submit a resource" or "Share your story"
   - Share/forward prompt
```

See the **structuring-offer-ladders** skill for designing the free → paid progression. See the **clarifying-market-fit** skill for ensuring email messaging matches the ICP.
