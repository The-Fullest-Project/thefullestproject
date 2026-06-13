"""CMS provider-directory supplement (caregiver-relevant licensed facilities).

Live-verified: the CMS Open Data API returns clean, per-state, key-less JSON of
enrolled providers (public domain). These are healthcare facilities, NOT
disability nonprofits, so this is a narrow SUPPLEMENT — we ingest only the most
caregiver-relevant type (home health agencies) and route them to the review
queue. Defaults to the pilot states to keep relevance and volume sane; widen via
env when desired.

Data courtesy of the Centers for Medicare & Medicaid Services (public domain).

Config (env):
  TFP_CMS_STATES   comma-separated state codes (default "VA,OR")
  TFP_CMS_MAX      cap per state (default 50)
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from base_scraper import make_resource, queue_new_resources, all_live_resource_keys
import pending_store
from _category_map import STATE_NAME
from _source_health import SourceRun, int_env

# Home Health Agency enrollments — per-state filterable (verified in recon).
DATASET_UUID = "15f64ab4-3172-4a27-b589-ebd67a6d28aa"
API = "https://data.cms.gov/data-api/v1/dataset/{uuid}/data"
USER_AGENT = "TheFullestProjectBot/1.0 (+https://thefullestproject.org/about/)"


def _states():
    env = os.environ.get("TFP_CMS_STATES", "VA,OR").strip()
    return [c.strip().upper() for c in env.split(",") if c.strip().upper() in STATE_NAME]


def _get(row, *names):
    for n in names:
        if row.get(n):
            return str(row[n]).strip()
    return ""


def _fetch_state(code, size):
    qs = urllib.parse.urlencode({"size": size, "filter[STATE]": code})
    url = f"{API.format(uuid=DATASET_UUID)}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _build_resource(row, code):
    name = _get(row, "ORGANIZATION NAME", "DOING BUSINESS AS NAME",
                "PROVIDER NAME", "Provider Name")
    if not name:
        return None
    dba = _get(row, "DOING BUSINESS AS NAME")
    return make_resource(
        name=dba or name,
        category="respite",  # home health = in-home caregiver support; reviewer can refine
        location=STATE_NAME[code],
        description="Medicare-enrolled home health agency providing in-home care services.",
        phone=_get(row, "TELEPHONE NUMBER", "telephone_number", "PHONE"),
        address=_get(row, "ADDRESS LINE 1", "address", "addr"),
        area=_get(row, "CITY", "City", "CITY/TOWN", "citytown"),
        tags=["cms", "home-health", "care-provider"],
        source="https://data.cms.gov/provider-data/",
    )


def _candidates_for_state(code, size):
    rows = _fetch_state(code, size)
    candidates, seen_local = [], set()
    for row in rows if isinstance(rows, list) else []:
        resource = _build_resource(row, code)
        if not resource:
            continue
        key = resource["name"].lower()
        if key in seen_local:
            continue
        seen_local.add(key)
        candidates.append(resource)
    return candidates


def scrape():
    """Queue caregiver-relevant CMS providers for review; never writes live data."""
    print("Discovering care providers via CMS Open Data...")
    run = SourceRun("cms_providers")
    states = _states()
    size = int_env("TFP_CMS_MAX", 50)
    seen = all_live_resource_keys() | pending_store.load_pending_keys("resource")

    for i, code in enumerate(states):
        run.attempt()
        try:
            candidates = _candidates_for_state(code, size)
        except Exception as e:  # per-state failure: logged, surfaced by finish()
            run.fail_target(f"{code}: {e}")
            continue

        run.succeed(seen=len(candidates))
        queued, seen = queue_new_resources(
            candidates, "cms_providers",
            target_file=f"src/_data/resources/states/{code}.json", seen=seen)
        run.queued(queued)

        if i < len(states) - 1:
            time.sleep(1)

    run.finish()


if __name__ == "__main__":
    scrape()
