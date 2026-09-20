"""Fill missing fields on resources already sitting in the review queue.

Scraped OSM entries arrive with a name, website and address but usually no
description, phone or refined category — which is what made the queue slow to
review. This walks pending resource envelopes and fills the gaps using
scrapers/_extraction.py: free structured markup (schema.org / JSON-LD / OG /
tel:) always, plus the Claude Haiku fallback when TFP_LLM_ENRICH=1 and
ANTHROPIC_API_KEY is set.

Only ever fills EMPTY fields — anything a reviewer has already written is left
alone. Safe to re-run; already-complete items are skipped without a fetch.

    python scripts/enrich_pending.py --dry-run
    TFP_LLM_ENRICH=1 ANTHROPIC_API_KEY=sk-... python scripts/enrich_pending.py --apply
    python scripts/enrich_pending.py --apply --limit 25
"""
import argparse
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scrapers"))
import _extraction  # noqa: E402
from _category_map import safe_category  # noqa: E402

PENDING = ROOT / "pending" / "scraped"
FILLABLE = ("description", "phone", "category")


def missing(payload):
    out = []
    for field in FILLABLE:
        value = payload.get(field)
        if field == "category":
            # "other" is the scraper's give-up value — treat it as missing.
            if not value or value in (["other"], "other"):
                out.append(field)
        elif not (value or "").strip():
            out.append(field)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="max items to fetch")
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between fetches")
    args = ap.parse_args()
    apply_changes = args.apply and not args.dry_run

    print(f"LLM fallback: {'ON' if _extraction.LLM_ENABLED else 'OFF (free extraction only)'}")
    fetched = filled = skipped = 0

    for path in sorted(PENDING.glob("*-resources.json")):
        items = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for it in items:
            if it.get("type") != "resource" or it.get("status") != "pending":
                continue
            payload = it.get("payload", {})
            gaps = missing(payload)
            website = (payload.get("website") or "").strip()
            if not gaps or not website:
                skipped += 1
                continue
            if args.limit and fetched >= args.limit:
                break

            fetched += 1
            try:
                found = _extraction.enrich(website, gaps)
            except Exception as e:
                print(f"  !  {payload.get('name','?')}: {e}")
                continue
            time.sleep(args.delay)

            got = []
            for field in gaps:
                value = found.get(field)
                if not value:
                    continue
                if field == "category":
                    payload["category"] = [safe_category(value if isinstance(value, str) else value[0])]
                else:
                    payload[field] = value.strip() if isinstance(value, str) else value
                got.append(field)
            if got:
                filled += 1
                changed = True
                print(f"  +  {payload.get('name','?')}: {', '.join(got)}")

        if changed and apply_changes:
            path.write_text(json.dumps(items, indent=2) + "\n", encoding="utf-8")

    print(f"\nfetched {fetched}, filled {filled}, skipped {skipped} (already complete or no website)")
    if not apply_changes:
        print("(dry run — nothing written; re-run with --apply)")


if __name__ == "__main__":
    main()
