"""Shared pending-review store for scraped content.

New items discovered by scrapers are queued here (repo-root pending/)
instead of being published directly. The admin review portal approves or
rejects them via the tfp-admin-api Cloudflare Worker, which moves approved
payloads into the live data files under src/_data/.

Layout:
  pending/submissions.json             - website submissions (worker-only writer)
  pending/scraped/<date>-<type>s.json  - weekly scraper batches (Actions-only creator)

The weekly Action only ever CREATES new dated batch files; the worker only
EDITS or DELETES existing ones, so the two writers never touch the same file
and git conflicts are structurally impossible.

pending/ lives outside src/_data so Eleventy never builds pending data into
the site. Set TFP_PENDING_DIR to relocate the store (used by tests).
"""

import hashlib
import json
import os
from datetime import date, datetime, timezone

_DEFAULT_PENDING = os.path.join(os.path.dirname(__file__), '..', 'pending')
PENDING_DIR = os.environ.get('TFP_PENDING_DIR', _DEFAULT_PENDING)
SCRAPED_DIR = os.path.join(PENDING_DIR, 'scraped')
SUBMISSIONS_FILE = os.path.join(PENDING_DIR, 'submissions.json')

ID_PREFIX = {
    "resource": "res",
    "story": "sty",
    "spotlight": "spt",
    "blog": "blg",
    "submission": "sub",
}


def _key_string(item_type, payload):
    """Stable identity string per content type, used for ids and dedup."""
    if item_type == "resource" or item_type == "submission":
        return f"{payload.get('name', '')}|{payload.get('location', '')}"
    if item_type == "story":
        return payload.get("sourceUrl", "")
    if item_type == "spotlight":
        return payload.get("name", "").lower().strip()
    if item_type == "blog":
        return payload.get("url", "") or payload.get("slug", "")
    return json.dumps(payload, sort_keys=True)


def new_id(item_type, payload):
    """Deterministic id: re-scrapes of the same item always produce the same id."""
    digest = hashlib.sha256(
        f"{item_type}|{_key_string(item_type, payload)}".encode("utf-8")
    ).hexdigest()[:8]
    prefix = ID_PREFIX.get(item_type, "itm")
    return f"{prefix}-{date.today().strftime('%Y%m%d')}-{digest}"


def make_envelope(item_type, payload, origin_detail, target_file=None, origin_type="scraper"):
    envelope = {
        "id": new_id(item_type, payload),
        "type": item_type,
        "status": "pending",
        "origin": {
            "type": origin_type,
            "detail": origin_detail,
            "submittedAt": datetime.now(timezone.utc).isoformat(),
        },
        "payload": payload,
    }
    if target_file:
        envelope["targetFile"] = target_file
    return envelope


def _load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return default
    return default


def _batch_file(item_type):
    return os.path.join(SCRAPED_DIR, f"{date.today().isoformat()}-{item_type}s.json")


def queue_items(item_type, envelopes):
    """Append envelopes to today's batch file, deduplicating by identity key
    (same item appearing twice in one run queues once; across days it is
    caught by load_pending_keys at the caller). Returns the number queued."""
    if not envelopes:
        return 0
    os.makedirs(SCRAPED_DIR, exist_ok=True)
    path = _batch_file(item_type)
    existing = _load_json(path, [])
    seen = {_key_string(e.get("type", item_type), e.get("payload", {})) for e in existing}
    added = 0
    for env in envelopes:
        key = _key_string(env.get("type", item_type), env.get("payload", {}))
        if key in seen:
            continue
        existing.append(env)
        seen.add(key)
        added += 1
    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    if added:
        print(f"Queued {added} {item_type}(s) for review in {path}")
    return added


def iter_pending(item_type=None):
    """Yield every pending envelope across the scraped batches and submissions."""
    files = []
    if os.path.isdir(SCRAPED_DIR):
        files = [os.path.join(SCRAPED_DIR, f) for f in sorted(os.listdir(SCRAPED_DIR))
                 if f.endswith(".json")]
    files.append(SUBMISSIONS_FILE)
    for path in files:
        for env in _load_json(path, []):
            if item_type is None or env.get("type") == item_type:
                yield env


def load_pending_keys(item_type):
    """Identity keys for everything of this type already awaiting review.

    resource/submission -> {(name, location)}; story -> {sourceUrl};
    spotlight -> {lowercased name}; blog -> {url} | {slug}.
    Submissions count toward the resource key set so a scraper can't re-queue
    something a person already submitted.
    """
    keys = set()
    types = {item_type}
    if item_type == "resource":
        types.add("submission")
    for env in iter_pending():
        if env.get("type") not in types:
            continue
        payload = env.get("payload", {})
        if item_type == "resource":
            keys.add((payload.get("name", ""), payload.get("location", "")))
        elif item_type == "story":
            keys.add(payload.get("sourceUrl", ""))
        elif item_type == "spotlight":
            keys.add(payload.get("name", "").lower().strip())
        elif item_type == "blog":
            keys.add(payload.get("url", ""))
            keys.add(payload.get("slug", ""))
    keys.discard("")
    return keys


def _envelope_age_days(env, now):
    """Age in days, or None if the timestamp is missing/unparseable."""
    submitted = env.get("origin", {}).get("submittedAt", "")
    try:
        ts = datetime.fromisoformat(submitted)
    except ValueError:
        return None
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return (now - ts).days


def _prune_summary(env):
    payload = env.get("payload", {})
    return {
        "id": env.get("id"),
        "type": env.get("type"),
        "title": payload.get("title") or payload.get("name", ""),
    }


def _prune_file(path, types, max_age_days, now):
    """Rewrite one batch file without its stale envelopes. Returns pruned summaries."""
    items = _load_json(path, [])
    kept, pruned = [], []
    for env in items:
        age = _envelope_age_days(env, now) if env.get("type") in types else None
        if age is not None and age > max_age_days:
            pruned.append(_prune_summary(env))
        else:
            kept.append(env)
    if pruned:
        if kept:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(kept, f, indent=2, ensure_ascii=False)
        else:
            os.remove(path)
    return pruned


def prune_stale(max_age_days=28, types=("story", "blog", "spotlight")):
    """Drop unreviewed news-type envelopes older than max_age_days so the queue
    stays fresh. Resources and human submissions are never auto-pruned.
    Deletes batch files that end up empty. Returns summaries of pruned items."""
    if not os.path.isdir(SCRAPED_DIR):
        return []
    now = datetime.now(timezone.utc)
    pruned = []
    for fn in sorted(os.listdir(SCRAPED_DIR)):
        if fn.endswith(".json"):
            pruned.extend(_prune_file(os.path.join(SCRAPED_DIR, fn), types, max_age_days, now))
    if pruned:
        print(f"Pruned {len(pruned)} stale unreviewed item(s) from the pending queue")
    return pruned
