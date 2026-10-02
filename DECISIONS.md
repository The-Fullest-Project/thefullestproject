# Decisions

Standing product decisions, with the reasoning. Newest first. If a decision
here conflicts with something in the code, the code is wrong.

## 2 October 2026 — Nicole's answers to the open questions

| Question | Decided |
|---|---|
| Three "Stay Connected" asks on the home page | **Resolved, no action.** One in the body and one in the footer is fine. |
| Move the featured resource into Spotlights (Jason) | **Discarded.** No action. |
| Merge Spotlights with Events & Activities (Jason) | **Leave as is** for now. No action. |
| Preview site address | **preview.thefullestproject.org** — not the free Cloudflare address. |
| Providers replying to reviews | **Deferred as recommended.** Reviews carry "Contact us about this review" wording instead, so providers have a route that isn't a public argument. |
| Forum categories at launch | **Five:** Adaptive Equipment · Therapy · Resources · IEP & School Advocacy · General Discussion — Caregiving Life |
| Duplicate detection | **Both approved:** a warning in the review queue at approval time, and a monthly duplicate report. |
| Phone submitting | **Build it.** Android share-menu target plus an iPhone Shortcut, with install instructions on the site. |
| Change-request log visibility | **Review-portal only.** Never public, never community-visible. |

### Review wording, agreed 2 October — build this with the ratings system

Providers cannot reply to reviews in version one. Instead, every resource page
carries a quiet line under its reviews, and a short page behind it:

> **Are you from this organization?** If something in a review isn't right,
> [contact us about this listing](/contact/?subject=listing) and a person will
> look at it.

Rules this encodes, which the ratings build must honour:

- The link is low-key, not a button. It is a route for providers, not an
  invitation to argue in public.
- It goes to the existing contact form with the subject prefilled, so these
  land somewhere a person actually reads.
- Nothing a provider sends appears on the page. A disputed review is hidden or
  kept by a human, never answered publicly — that is the whole point of
  deferring provider replies.

## 30 September 2026 — accounts, ratings and community

Agreed by Nicole; recommendations accepted as written.

| # | Decision | Reasoning |
|---|---|---|
| 1 | Build **one shared account system** under favourites, ratings and the forum | Two systems means writing registration, verification, moderation and banning twice, then merging live user records — a migration with no clean rollback. Costs the forum ~2 weeks. |
| 2 | Every resource gets a **permanent ID** before any rating is stored | Resources are identified by name + location today, and the portal lets names be edited. A rename would orphan every rating silently. |
| 3 | Reviews **publish immediately**, with a fast report-and-hide path | Approval-first does not scale past a few reviews a week, and it all funnels through one person. |
| 4 | Providers **cannot reply to reviews** in version one | It is the only item that adds permanent ongoing moderation work. Needs identity verification, doubles the moderation surface, and turns disputes into public arguments. Costs no more to add later. |
| 5 | **Display names**, first name only by default | Caregivers discussing their children's disabilities in public need the option not to be identifiable. |
| 6 | Reviewers tick **"I have used this service"** — asked, not verified | Sets the expectation without a verification process we cannot actually run. |
| 7 | Star ratings show in Google results at a **minimum of three ratings** | One 2-star review looks worse in search than no stars at all. |
| 8 | Forum launches with **5–6 categories**, not the 11 in the original plan | Empty categories make a community look abandoned. Add more as conversation appears. |
| 9 | Preview site uses the **free Cloudflare address**, with its own database | Only three people will ever see it. A separate database keeps test accounts and junk reviews out of real records. |
| 10 | Change-request log is **private now**, built so it can be opened up later | Changes how entries get written, so it is worth deciding before building. |

### Categories and taxonomy

- `categories.json` is **sorted alphabetically by label at source**. The
  Resources hub sorts at render time, which hid the fact that the review
  portal's category dropdown iterates the raw file order. Keep the file sorted
  when adding a category.
- Jason's seven-group category structure is accepted, with one change:
  **"Health Care & Therapy" needs renaming** — it reads oddly against the
  September decision to stop listing therapy providers.

### Resolved since

All three open points were answered on 2 October: Spotlights and Events stay
separate, the featured-resource move is discarded, and the "How We Can Help"
wording shipped as a draft Nicole can edit in Site Pages.

## September 2026 — directory scope

Therapy and wellness providers are **not discovered by scrapers**. Physical,
occupational and speech therapy, general rehabilitation, drug and alcohol
rehab, wellness businesses, skilled nursing, home health and personal care
agencies are all out of scope for automated discovery. They enter the
directory only through a referral from a real family.

The gate is `scrapers/_category_map.is_disability_specific()`. See
`scrapers/README.md` for how it decides.
