"""Base scraper utilities for The Fullest Project resource collection."""

import inspect
import json
import os
from datetime import date

import pending_store


# TFP_* env vars relocate the directories for tests
OUTPUT_DIR = os.environ.get('TFP_OUTPUT_DIR',
                            os.path.join(os.path.dirname(__file__), 'output'))
DATA_DIR = os.environ.get('TFP_DATA_DIR',
                          os.path.join(os.path.dirname(__file__), '..', 'src', '_data', 'resources'))
BLOCKLIST_FILE = os.environ.get('TFP_BLOCKLIST_FILE',
                                os.path.join(os.path.dirname(__file__), 'blocklist.json'))


def make_resource(name, category, location, description, website=None,
                  phone=None, address=None, area=None, age_range=None,
                  disability_types=None, cost=None, tags=None, source=None):
    """Create a standardized resource entry."""
    return {
        "name": name,
        "category": category if isinstance(category, list) else [category],
        "location": location,
        "area": area or "",
        "description": description,
        "phone": phone or "",
        "website": website or "",
        "address": address or "",
        "ageRange": age_range or "",
        "disabilityTypes": disability_types or [],
        "cost": cost or "",
        "tags": tags or [],
        "source": source or website or "",
        "lastScraped": date.today().isoformat()
    }


def save_resources(resources, filename, origin_detail=None):
    """Write updates to already-live entries; queue NEW entries for admin review.

    Entries whose (name, location) key already exists in the live file pass
    through unchanged (refreshed lastScraped, merged tags, etc.). Entries not
    yet live anywhere are queued to pending/ for approval via the admin review
    portal instead of publishing directly.

    filename can include subdirectory, e.g. 'states/VA.json'
    """
    prior_keys = {(r['name'], r.get('location', '')) for r in load_existing(filename)}
    live, new = [], []
    for r in resources:
        key = (r['name'], r.get('location', ''))
        (live if key in prior_keys else new).append(r)

    if new:
        # Guard against duplicates already live in another file or already queued
        seen = all_live_resource_keys() | pending_store.load_pending_keys('resource')
        new = [r for r in new if (r['name'], r.get('location', '')) not in seen]
    if new:
        if origin_detail is None:
            origin_detail = _caller_module_name()
        target = 'src/_data/resources/' + filename.replace('\\', '/')
        envelopes = [pending_store.make_envelope('resource', r, origin_detail, target_file=target)
                     for r in new]
        pending_store.queue_items('resource', envelopes)

    _write_live(live, filename)


def _write_live(resources, filename):
    """Save resources to both output dir and site data dir.

    filename can include subdirectory, e.g. 'states/VA.json'
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    # Ensure subdirectories exist
    output_path = os.path.join(OUTPUT_DIR, filename)
    data_path = os.path.join(DATA_DIR, filename)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)

    # Save to output dir
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(resources, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(resources)} resources to {output_path}")

    # Also save to site data dir for build
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(resources, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(resources)} resources to {data_path}")


def _load_entry_list(path):
    """Load a JSON file expected to hold a list; empty list on any failure."""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            entries = json.load(f)
    except (json.JSONDecodeError, OSError):
        return []
    return entries if isinstance(entries, list) else []


def all_live_resource_keys():
    """(name, location) keys across every live resource file."""
    keys = set()
    for root, _dirs, files in os.walk(DATA_DIR):
        for fn in files:
            if not fn.endswith('.json'):
                continue
            for r in _load_entry_list(os.path.join(root, fn)):
                if isinstance(r, dict) and 'name' in r:
                    keys.add((r['name'], r.get('location', '')))
    return keys


def _caller_module_name():
    """Name of the scraper module that called save_resources (for provenance)."""
    frame = inspect.currentframe()
    try:
        caller = frame.f_back.f_back  # skip save_resources itself
        module = inspect.getmodule(caller)
        if module and module.__name__ not in ('__main__', __name__):
            return module.__name__.rsplit('.', 1)[-1]
        if caller and caller.f_code.co_filename:
            return os.path.splitext(os.path.basename(caller.f_code.co_filename))[0]
    finally:
        del frame
    return 'unknown'


def load_existing(filename):
    """Load existing resources from data dir for merging.

    filename can include subdirectory, e.g. 'states/VA.json'
    """
    data_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(data_path):
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def load_blocklist():
    """Load the URL blocklist (known-bad URLs that scrapers should not re-add)."""
    if os.path.exists(BLOCKLIST_FILE):
        with open(BLOCKLIST_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"urls": [], "names": []}


def is_blocked(resource, blocklist=None):
    """Check if a scraped resource matches the blocklist."""
    if blocklist is None:
        blocklist = load_blocklist()
    url = resource.get('website', '')
    name = resource.get('name', '')
    if url in blocklist.get('urls', []):
        print(f"Blocked URL: {url} ({name})")
        return True
    if name in blocklist.get('names', []):
        print(f"Blocked name: {name}")
        return True
    return False


def merge_resources(existing, scraped):
    """Merge scraped resources with existing, deduplicating by name + location.

    Scraped resources with blocklisted URLs or names are skipped to prevent
    re-adding resources with known-bad URLs that have been manually fixed.
    """
    blocklist = load_blocklist()
    merged = {(r['name'], r['location']): r for r in existing}

    for r in scraped:
        if is_blocked(r, blocklist):
            continue
        key = (r['name'], r['location'])
        if key in merged:
            # Update existing entry with scraped data but keep manual fields
            old = merged[key]
            r['tags'] = list(set(old.get('tags', []) + r.get('tags', [])))
            merged[key] = r
        else:
            merged[key] = r

    return list(merged.values())
