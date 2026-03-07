# Content & Copy Reference

## Contents
- Brand Voice in Email
- Subject Line Patterns
- Body Copy Structure
- WARNING: Tone Drift Between Site and Email
- CTA Copy Patterns
- Empty-State to Email Bridge

---

## Brand Voice in Email

The site uses a warm, empowering, practical tone. Email copy must match. The brand voice is defined by the site's mission and founder bios — two mothers of children with disabilities.

### Voice Principles for Lifecycle Messages

| Principle | DO | DON'T |
|-----------|-----|-------|
| Empathy first | "We know how overwhelming this can be" | "You need to find resources" |
| Practical | "Here are 3 resources for IEP prep" | "We have many resources" |
| Community | "Other caregivers have found..." | "Our database contains..." |
| Empowering | "You're already doing the hard work" | "Don't worry, we'll help you" |
| Direct | "Browse therapy providers near you" | "Feel free to explore our comprehensive therapy directory" |

### Founder Voice

The site has two founders (Erin and Nicole). Lifecycle emails should come from a real person, not a brand:

```markdown
# GOOD — personal, warm
From: Erin & Nicole <hello@thefullestproject.org>
Subject: Welcome to The Fullest Project

Hi —

We started this project because we've been where you are.

# BAD — corporate, impersonal
From: The Fullest Project <noreply@thefullestproject.org>
Subject: Welcome to Our Platform

Dear Subscriber,

Thank you for signing up for our newsletter.
```

See the **tightening-brand-voice** skill for the full voice guidelines used across the site.

---

## Subject Line Patterns

Subject lines must be under 50 characters, avoid spam triggers, and match the caregiver context.

### Tested Patterns for Caregiver Audiences

```markdown
# Welcome sequence
"Welcome to The Fullest Project"          # 35 chars — direct
"3 things caregivers wish they knew"      # 37 chars — curiosity
"You're not doing this alone"             # 29 chars — emotional

# Content notifications
"New: IEP prep checklist"                 # 24 chars — utility
"This week's top resources"               # 27 chars — roundup
"[Podcast] Ep 1: Starting the journey"    # 37 chars — content type tag

# Product launches
"The gig platform is live"               # 27 chars — announcement
"Early access: Caregiver Gig Platform"    # 37 chars — exclusivity

# Re-engagement
"Still looking for resources?"            # 31 chars — question
"We added 47 new resources this month"    # 39 chars — value proof
```

### WARNING: Subject Line Anti-Patterns

```markdown
# BAD — spam trigger words
"FREE resources for your disabled child!!!"
"Don't miss out on these AMAZING resources"
"Act now — limited time offer"

# BAD — too vague
"Newsletter #12"
"Monthly update"
"News from The Fullest Project"

# BAD — too long (truncated on mobile)
"We have some exciting new resources we think you'll really love for your family"
```

---

## Body Copy Structure

Every lifecycle email follows a three-part structure:

```markdown
## Email Body Template

### 1. Acknowledgment (1-2 sentences)
Connect with the caregiver's reality. Reference their specific action.

"Thanks for joining our community. We know that finding the right
resources for your family can feel like a full-time job on top of
everything else."

### 2. Value (2-3 items)
Link to specific site pages. Use the exact page titles and URLs.

"Here's where to start:
→ Browse resources in your area: /resources/
→ Understand therapy options: /therapy-guide/
→ Navigate school accommodations: /school-iep/"

### 3. Single CTA (1 button/link)
One action per email. The most important link gets the button.

"Find Resources Near You → /resources/"
```

### DO: Match Email Copy to Page Copy

The email CTA text should mirror the on-page heading the user will see when they click:

```markdown
# GOOD — email CTA matches destination page heading
Email CTA: "Browse the Therapy Guide"
Page heading (therapy-guide/index.njk): "Understanding Therapy Options"
# Close enough — user knows where they're going

# BAD — email CTA doesn't match anything
Email CTA: "Explore Our Comprehensive Resource Library"
Page heading (resources.njk): "Resource Directory"
# Disconnect — user feels lost on arrival
```

See the **crafting-page-messaging** skill for the actual page headings and CTAs to match against.

---

## WARNING: Tone Drift Between Site and Email

**The Problem:** Site copy is warm and empowering. Email copy often drifts into corporate/transactional tone because email templates are written separately from the site.

**Why This Breaks:**
1. Subscriber feels like they're hearing from a different brand
2. Trust erodes — the personal touch that converted them disappears
3. Unsubscribe rates spike on tone-deaf emails

**The Fix:** Before sending any lifecycle email, compare against these on-site reference points:

```njk
{# Homepage hero — src/pages/index.njk #}
"A connection hub for caregivers of individuals with disabilities"

{# About page mission — src/pages/about.njk #}
"Be a connection hub for caregivers to find national and local special needs
and disability information, resources, programs, education, and community."

{# Blog welcome post — src/blog/welcome.md #}
"We started The Fullest Project because we've lived this journey ourselves."
```

Match that energy in email. If your email draft wouldn't feel at home on the about page, rewrite it.

---

## CTA Copy Patterns

### Primary CTAs (One Per Email)

| Sequence | Email | CTA Text | URL |
|----------|-------|----------|-----|
| Welcome Day 0 | Welcome | "Find Resources Near You" | /resources/ |
| Welcome Day 3 | Depth | "Read the Guide" | /school-iep/ |
| Welcome Day 7 | Community | "Share a Resource" | /submit-resource/ |
| Gig Launch | Notify | "Explore the Platform" | /services/ |
| Re-engage | Win-back | "See What's New" | /resources/ |

### Secondary Links (In-Line, Not Buttons)

```markdown
# GOOD — primary CTA is a button, secondary links are inline text
Check out our therapy guide → /therapy-guide/
Or browse adaptive equipment → /adaptive-equipment/

[Find Resources Near You]  ← this is the button

# BAD — multiple buttons compete for attention
[Find Resources] [Read Blog] [Browse Equipment] [Contact Us]
```

---

## Empty-State to Email Bridge

The blog and podcast pages have empty-state messages that promise newsletter notifications:

```njk
{# src/pages/blog.njk line 33 #}
"Sign up for our newsletter to be notified when new posts are published."

{# src/pages/podcast.njk line 46 #}
"Sign up for our newsletter to be notified when our first episode drops."
```

The lifecycle sequence must deliver on these promises. When a blog post or podcast episode goes live, subscribers who signed up from these pages expect a notification email. Use the `source` hidden field to segment these subscribers.

```njk
{# Add to blog page newsletter form if one is added #}
<input type="hidden" name="source" value="blog-empty-state">
<input type="hidden" name="interest" value="blog-notifications">
```

See the **tightening-brand-voice** skill for ensuring empty-state copy aligns with email follow-through.
