# Measurement & Testing Reference

## Contents
- Key Metrics for Lifecycle Sequences
- Formspree-Level Tracking
- ESP-Level Analytics
- WARNING: No Analytics Currently Instrumented
- A/B Testing Patterns
- Iterate-Until-Pass Workflow

---

## Key Metrics for Lifecycle Sequences

### Funnel Metrics

| Stage | Metric | Target | Measured Where |
|-------|--------|--------|---------------|
| Acquisition | Signup rate | 2-5% of page visitors | Form submissions / page views |
| Activation | Welcome email open rate | >50% | ESP analytics |
| Engagement | Click-through rate (CTR) | >3% | ESP analytics |
| Retention | 30-day active rate | >40% of subscribers | ESP engagement data |
| Referral | Resource submissions from subscribers | Growing | Formspree + source tag |

### Per-Sequence Metrics

```markdown
## Welcome Sequence (3 emails)
- Email 1 open rate target: 60%+ (welcome emails have highest opens)
- Email 2 open rate target: 40%+
- Email 3 open rate target: 35%+
- Sequence completion CTR: 5%+ clicked at least one link

## Re-engagement Sequence (2 emails)
- Email 1 open rate: 15%+ (these are cold subscribers)
- Win-back rate: 10%+ of re-engaged subscribers
- Unsubscribe rate: <5% (some churn is healthy here)
```

---

## Formspree-Level Tracking

Formspree provides basic submission counts but no email engagement analytics. Use hidden fields to capture context that the ESP can use for measurement.

### Tracking Fields to Add

```njk
{# Add to all newsletter forms for attribution #}
<input type="hidden" name="source" value="{{ page.url }}">
<input type="hidden" name="interest" value="general">
<input type="hidden" name="_subject" value="Newsletter signup from {{ page.url }}">
```

### Formspree Submission Dashboard

Formspree's dashboard shows:
- Total submissions per form
- Submission timestamps
- Field values (source, interest, email)

This gives you acquisition data but nothing about email delivery or engagement.

---

## ESP-Level Analytics

Once an ESP is connected (see [distribution](distribution.md)), track these metrics:

### ConvertKit Analytics

```markdown
## Available metrics per sequence:
- Open rate per email
- Click rate per email (and per link)
- Unsubscribe rate per email
- Sequence completion rate
- Tag-based segment performance

## Available metrics per broadcast:
- Open rate
- Click rate
- Revenue (if applicable)
- Subscriber growth/churn
```

### Engagement Scoring

Build a simple engagement score based on ESP data:

```markdown
| Action | Points |
|--------|--------|
| Opened email | +1 |
| Clicked link | +3 |
| Visited site from email (UTM) | +5 |
| Submitted resource | +10 |
| No opens in 30 days | -5 |
| Unsubscribed | Remove from scoring |
```

Subscribers below 0 points enter the re-engagement sequence.

---

## WARNING: No Analytics Currently Instrumented

**Detected:** No analytics service (Google Analytics, Plausible, Fathom) in the codebase. No UTM parameter handling in email links or on-site tracking.

**Impact:**
1. Cannot measure email → site visit conversion
2. Cannot attribute resource views to lifecycle emails
3. Cannot compare sequence performance over time
4. Flying blind on which emails actually drive engagement

### Recommended Solution

Add UTM parameters to every link in lifecycle emails:

```markdown
# Pattern for email links
https://thefullestproject.org/resources/?utm_source=email&utm_medium=lifecycle&utm_campaign=welcome-day0

# Breakdown:
# utm_source=email          → Traffic source
# utm_medium=lifecycle      → Distinguishes from broadcast/transactional
# utm_campaign=welcome-day0 → Specific email in sequence
```

Then add a privacy-respecting analytics tool to `src/_includes/layouts/base.njk`:

```html
<!-- Plausible Analytics (privacy-respecting, no cookies) -->
<script defer data-domain="thefullestproject.org"
  src="https://plausible.io/js/script.js"></script>
```

See the **mapping-conversion-events** skill for full instrumentation guidance. See the **instrumenting-product-metrics** skill for tracking site-level engagement.

---

## A/B Testing Patterns

### Subject Line Testing

Most ESPs support A/B testing on subject lines. Test these pairs for the caregiver audience:

```markdown
## Welcome Email Subject A/B Tests

Test 1: Emotional vs. Practical
  A: "Welcome to The Fullest Project"       (brand-forward)
  B: "Your resource guide is ready"          (utility-forward)

Test 2: Personal vs. Inclusive
  A: "Hi from Erin & Nicole"                 (personal)
  B: "Welcome to the caregiver community"    (community)

Test 3: Short vs. Descriptive
  A: "You're in!"                            (short, energetic)
  B: "Welcome — here's where to start"       (sets expectation)
```

### Send Time Testing

```markdown
## Caregiver Audience Send Time Hypotheses

Hypothesis 1: Early morning (6-7 AM) — before kids wake up
Hypothesis 2: Nap time (1-2 PM) — brief quiet window
Hypothesis 3: Evening (8-9 PM) — after bedtime routine

Test each over 2-week periods. Measure open rate within 2 hours of send.
```

### CTA Testing

```markdown
## Welcome Email CTA A/B Tests

Test 1: Action verb
  A: "Find Resources"
  B: "Browse Resources Near You"

Test 2: Emotional vs. Functional
  A: "Start Your Search"
  B: "Get Support Now"
```

---

## Iterate-Until-Pass Workflow

Use this workflow when launching or revising a lifecycle sequence:

```markdown
1. Draft sequence (subject lines, body copy, CTAs)
2. Validate:
   - Every link resolves to a real page on thefullestproject.org
   - Subject lines are under 50 characters
   - Body copy matches brand voice (compare to src/pages/about.njk tone)
   - Single primary CTA per email
   - UTM parameters on all links
   - Unsubscribe link present
3. If validation fails, fix issues and repeat step 2
4. Only proceed to ESP configuration when all checks pass
5. Send test email to team (Erin, Nicole)
6. Review rendering on mobile + desktop
7. If rendering issues, fix and repeat steps 5-6
8. Launch to 10% of list as canary
9. Monitor open rate and unsubscribe rate for 48 hours
10. If metrics are acceptable (open >30%, unsub <2%), roll out to full list
```

Copy this checklist and track progress:
- [ ] Draft sequence copy
- [ ] Validate all links resolve to real pages
- [ ] Validate subject line length (<50 chars)
- [ ] Validate brand voice alignment
- [ ] Validate UTM parameters on all links
- [ ] Send test email to founders
- [ ] Review mobile + desktop rendering
- [ ] Canary deploy to 10% of list
- [ ] Monitor 48-hour metrics
- [ ] Full rollout
