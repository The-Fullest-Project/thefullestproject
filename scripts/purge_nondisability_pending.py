"""One-off + re-runnable purge of non-disability-specific items from the review queue.

Applies the same gate the scrapers now use (_category_map.is_disability_specific)
to every pending resource envelope. Items that fail are dropped from
pending/scraped/*.json. Run with --dry-run first.

    python scripts/purge_nondisability_pending.py --dry-run
    python scripts/purge_nondisability_pending.py --apply
"""
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scrapers"))
from _category_map import is_disability_specific  # noqa: E402

PENDING = ROOT / "pending" / "scraped"


def envelope_tags(payload):
    """Rebuild the subset of source tags the gate needs from a queued payload.

    Queued envelopes keep only the OSM tag *values* (social_facility:for,
    healthcare, office, shop), so a value containing 'disabled'/'autism' is the
    structured disability signal.
    """
    values = [str(t).lower() for t in (payload.get("tags") or [])]
    marker = ";".join(v for v in values if "disabled" in v or "autism" in v)
    return {"social_facility:for": marker} if marker else {}


def classify(payload):
    return is_disability_specific(
        payload.get("name", ""),
        envelope_tags(payload),
        description=payload.get("description", ""),
        extra=" ".join(payload.get("tags") or []),
    )


def main(apply_changes):
    kept_total = dropped_total = 0
    kept_cats, dropped_cats, kept_sources = Counter(), Counter(), Counter()
    kept_examples, dropped_examples = [], []

    for path in sorted(PENDING.glob("*-resources.json")):
        items = json.loads(path.read_text(encoding="utf-8"))
        keep = []
        for it in items:
            if it.get("type") != "resource" or it.get("status") != "pending":
                keep.append(it)          # never touch non-pending or non-resource rows
                continue
            payload = it.get("payload", {})
            if classify(payload):
                keep.append(it)
                kept_total += 1
                for c in payload.get("category") or ["other"]:
                    kept_cats[c] += 1
                kept_sources[(it.get("origin") or {}).get("detail", "?")] += 1
                if len(kept_examples) < 40:
                    kept_examples.append(payload.get("name", ""))
            else:
                dropped_total += 1
                for c in payload.get("category") or ["other"]:
                    dropped_cats[c] += 1
                if len(dropped_examples) < 40:
                    dropped_examples.append(payload.get("name", ""))

        if apply_changes and len(keep) != len(items):
            if keep:
                path.write_text(json.dumps(keep, indent=2) + "\n", encoding="utf-8")
            else:
                path.unlink()

    print(f"KEPT    {kept_total}")
    print(f"DROPPED {dropped_total}")
    print("\nKept by category:")
    for c, n in kept_cats.most_common():
        print(f"  {n:>4}  {c}")
    print("\nKept by source:")
    for s, n in kept_sources.most_common():
        print(f"  {n:>4}  {s}")
    print("\nDropped by category:")
    for c, n in dropped_cats.most_common():
        print(f"  {n:>4}  {c}")
    print("\nSample KEPT:   " + " | ".join(kept_examples[:25]))
    print("\nSample DROPPED: " + " | ".join(dropped_examples[:25]))
    if not apply_changes:
        print("\n(dry run — nothing written; re-run with --apply)")


if __name__ == "__main__":
    main("--apply" in sys.argv)
