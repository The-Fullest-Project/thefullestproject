"""Google News RSS lead discovery — DISABLED BY DEFAULT.

Live-verified to surface newly-announced disability programs/centers (org name
and city are usually parseable from the headline). BUT two hard caveats make
this opt-in only:

  1. ToS: Google News RSS restricts the feed to personal, non-commercial
     feed-reader use. Programmatic harvest into a published directory is
     arguably outside those terms. ENABLE ONLY with that understanding.
  2. The link is a Google News redirect, not the org's own site, so every lead
     is queued WITHOUT a website (tagged "needs-website") for a human to resolve
     in the review portal. Leads are tips, never auto-published resources.

Enable with env TFP_NEWS_LEADS=1. Off by default, so run_all.py auto-discovers
this module but scrape() no-ops unless explicitly turned on.

Config (env):
  TFP_NEWS_LEADS    "1" to enable (default off)
  TFP_NEWS_STATES   comma-separated states to localize queries (default "VA,OR")
"""

import os
import html
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from base_scraper import load_blocklist, queue_new_resources
from _category_map import STATE_NAME, is_disability_relevant
from _source_health import SourceRun

USER_AGENT = "Mozilla/5.0 (compatible; TheFullestProjectBot/1.0; +https://thefullestproject.org/about/)"
VERB_QUERIES = [
    "disability resource center opens",
    "new autism center opens",
    "adaptive recreation program launches",
    "special needs nonprofit opens",
    "respite care program launches",
    "disability services organization opens",
]


def _enabled():
    return os.environ.get("TFP_NEWS_LEADS", "") in ("1", "true", "yes")


def _states():
    env = os.environ.get("TFP_NEWS_STATES", "VA,OR").strip()
    return [c.strip().upper() for c in env.split(",") if c.strip().upper() in STATE_NAME]


def _extract_tag(xml, tag):
    start = xml.find(f"<{tag}")
    if start == -1:
        return None
    cstart = xml.find(">", start) + 1
    end = xml.find(f"</{tag}>", cstart)
    if end == -1:
        return None
    content = xml[cstart:end].strip()
    if content.startswith("<![CDATA["):
        content = content[9:]
    if content.endswith("]]>"):
        content = content[:-3]
    return html.unescape(content.strip()) or None  # decode &amp; &#39; etc.


def _org_from_headline(title):
    """Heuristic: org name is usually the text before the action verb. When no
    verb matches, drop a trailing ' - Publisher' / ' | Publisher' segment so the
    publisher name doesn't leak into the queued resource name."""
    for verb in (" opens", " launches", " announces", " to launch", " to open", " debuts", " unveils"):
        idx = title.lower().find(verb)
        if idx > 3:
            return title[:idx].strip(" :-—|")
    for sep in (" - ", " | ", " — "):
        if sep in title:
            return title.rsplit(sep, 1)[0].strip()
    return title.strip()


def _fetch(query):
    url = ("https://news.google.com/rss/search?q="
           + urllib.parse.quote(query) + "+when:14d&hl=en-US&gl=US&ceid=US:en")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def _lead_from_item(item, blocklist, seen):
    """Parse one RSS <item> into a lead candidate, or None to skip."""
    title = _extract_tag(item, "title")
    link = _extract_tag(item, "link")
    if not title or not link or not is_disability_relevant(title):
        return None
    org = _org_from_headline(title)
    key = org.lower()
    if key in seen or link in blocklist.get("urls", []) or org in blocklist.get("names", []):
        return None
    seen.add(key)
    return {
        "name": org,
        "category": ["other"],
        "location": "National",
        "area": "",
        "description": f"Lead from news headline: \"{title}\". Resolve the organization's "
                       f"official website and details before publishing.",
        "phone": "", "website": "", "address": "", "ageRange": "",
        "disabilityTypes": [], "cost": "",
        "tags": ["news-lead", "needs-website", "needs-review"],
        "source": link,
        "lastScraped": datetime.now().strftime("%Y-%m-%d"),
    }


def scrape():
    if not _enabled():
        print("news_leads: disabled (set TFP_NEWS_LEADS=1 to enable — see module docstring on ToS).")
        return

    print("Discovering resource leads via Google News RSS...")
    run = SourceRun("news_leads")
    blocklist = load_blocklist()
    states = _states()
    queries = list(VERB_QUERIES) + [f"disability program new {STATE_NAME[c]}" for c in states]

    candidates, seen = [], set()
    for q in queries:
        run.attempt()
        try:
            content = _fetch(q)
        except Exception as e:  # per-query failure: logged, surfaced by finish()
            run.fail_target(f"{q}: {e}")
            continue
        found = 0
        for item in content.split("<item>")[1:6]:
            lead = _lead_from_item(item, blocklist, seen)
            if lead:
                candidates.append(lead)
                found += 1
        run.succeed(seen=found)
        time.sleep(1)

    queued, _ = queue_new_resources(candidates, "news_leads")
    run.queued(queued)
    run.finish()


if __name__ == "__main__":
    scrape()
