#!/bin/bash
# UserPromptSubmit hook for skill-aware responses

cat <<'EOF'
REQUIRED: SKILL LOADING PROTOCOL

Before writing any code, complete these steps in order:

1. SCAN each skill below and decide: LOAD or SKIP (with brief reason)
   - eleventy
   - frontend-design
   - tailwind
   - javascript
   - nunjucks
   - python
   - json
   - ftp
   - github-actions
   - markdown
   - mapping-user-journeys
   - scoping-feature-work
   - instrumenting-product-metrics
   - designing-onboarding-paths
   - orchestrating-feature-adoption
   - structuring-offer-ladders
   - designing-inapp-guidance
   - crafting-page-messaging
   - tightening-brand-voice
   - clarifying-market-fit
   - triaging-user-feedback
   - designing-lifecycle-messages
   - tuning-landing-journeys
   - mapping-conversion-events
   - inspecting-search-coverage
   - adding-structured-signals

2. For every skill marked LOAD → immediately invoke Skill(name)
   If none need loading → write "Proceeding without skills"

3. Only after step 2 completes may you begin coding.

IMPORTANT: Skipping step 2 invalidates step 1. Always call Skill() for relevant items.

Sample output:
- eleventy: LOAD - building components
- frontend-design: SKIP - not needed for this task
- tailwind: LOAD - building components
- javascript: SKIP - not needed for this task

Then call:
> Skill(eleventy)
> Skill(tailwind)

Now implementation can begin.
EOF
