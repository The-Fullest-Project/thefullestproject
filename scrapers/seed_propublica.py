"""ONE-TIME ProPublica nonprofit seed — run manually, NOT on the weekly cron.

Lives in scrapers/ (not sources/) so run_all.py never auto-runs it. The
ProPublica Nonprofit Explorer is a near-static IRS registry (≈0 new orgs/week)
with NO website and NO description fields, so it's useless as a weekly feed but
useful as a ONE-TIME seed of candidate disability nonprofits by state. Each
queued entry needs a reviewer to add website/description (and the optional
extraction layer can help) before publishing.

Run:
  python scrapers/seed_propublica.py            # all states + DC
  python scrapers/seed_propublica.py VA OR      # specific states
"""

import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from base_scraper import queue_new_resources
from _category_map import STATE_NAME, ALL_STATE_CODES
from _source_health import SourceRun

API = "https://projects.propublica.org/nonprofits/api/v2/search.json"
USER_AGENT = "TheFullestProjectBot/1.0 (+https://thefullestproject.org/about/)"
# NTEE major-group prefixes that map to disability/caregiver relevance
RELEVANT_NTEE_PREFIXES = ("P", "E", "F", "G", "H")  # human services, health, mental health, etc.


def _fetch(state_code, page):
    params = {"q": "disability", "state[id]": state_code, "page": page}
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _fetch_state_orgs(code, run):
    """Fetch up to 8 pages of disability orgs for one state."""
    first = _fetch(code, 0)
    num_pages = min(first.get("num_pages", 1), 8)  # cap to stay polite
    orgs = list(first.get("organizations", []))
    for page in range(1, num_pages):
        try:
            orgs += _fetch(code, page).get("organizations", [])
            time.sleep(0.5)
        except Exception as e:  # one bad page shouldn't drop the state
            run.fail_target(f"{code} p{page}: {e}")
            break
    return orgs


def _org_to_candidate(org, code):
    name = (org.get("name") or "").strip()
    ntee = (org.get("ntee_code") or "").strip()
    if not name or (ntee and ntee[0] not in RELEVANT_NTEE_PREFIXES):
        return None
    return {
        "name": name,
        "category": ["nonprofit"],
        "location": STATE_NAME[code],
        "area": (org.get("city") or "").strip(),
        "description": "Registered disability-related nonprofit (IRS). "
                       "Add website and description before publishing.",
        "phone": "", "website": "", "address": "", "ageRange": "",
        "disabilityTypes": [], "cost": "",
        "tags": ["propublica-seed", "needs-website", "needs-category", f"ein-{org.get('ein', '')}"],
        "source": f"https://projects.propublica.org/nonprofits/organizations/{org.get('ein', '')}",
        "lastScraped": datetime.now().strftime("%Y-%m-%d"),
    }


def seed(states):
    run = SourceRun("seed_propublica")
    candidates = []
    for code in states:
        run.attempt()
        try:
            orgs = _fetch_state_orgs(code, run)
        except Exception as e:
            run.fail_target(f"{code}: {e}")
            continue
        added = [c for c in (_org_to_candidate(o, code) for o in orgs) if c]
        candidates.extend(added)
        run.succeed(seen=len(added))
        time.sleep(0.5)

    queued, _ = queue_new_resources(candidates, "propublica-seed")
    run.queued(queued)
    run.finish(raise_on_failure=False)
    print(f"\nSeeded {queued} candidate nonprofits into the review queue.")


if __name__ == "__main__":
    args = [a.strip().upper() for a in sys.argv[1:] if a.strip().upper() in STATE_NAME]
    seed(args or ALL_STATE_CODES)
