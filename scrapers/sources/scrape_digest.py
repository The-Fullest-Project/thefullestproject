"""
Scrape Digest Generator
Generates a summary of resources and articles added during the weekly scrape.
Sends digest email to info@thefullestproject.org via Formspree.
"""

import json
import os
import sys
from datetime import datetime, date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pending_store

LOG_DIR = Path(__file__).parent.parent / "logs"
DATA_DIR = Path(__file__).parent.parent.parent / "src" / "_data"
BLOG_DIR = Path(__file__).parent.parent.parent / "src" / "blog"

# Formspree endpoint for digest emails — uses contact form
FORMSPREE_URL = "https://formspree.io/f/mzdjzzvw"


def load_scrape_log():
    """Load the most recent scrape log entries from this run."""
    log_file = LOG_DIR / "scrape_log.json"
    if not log_file.exists():
        return []
    with open(log_file, "r", encoding="utf-8") as f:
        logs = json.load(f)

    # Filter to entries from today
    today = date.today().isoformat()
    return [log for log in logs if log.get("timestamp", "").startswith(today)]


def count_new_blog_posts():
    """Count blog posts created today."""
    today = date.today().isoformat()
    count = 0
    new_posts = []
    if BLOG_DIR.exists():
        for f in BLOG_DIR.glob("*.md"):
            try:
                content = f.read_text(encoding="utf-8")
                if f"date: {today}" in content:
                    # Extract title from front matter
                    for line in content.split("\n"):
                        if line.startswith("title:"):
                            title = line.split(":", 1)[1].strip().strip('"')
                            new_posts.append(title)
                            count += 1
                            break
            except Exception:
                continue
    return count, new_posts


def summarize_pending():
    """Count what awaits review and what this run queued, by type. Read-only —
    pruning happens in its own workflow step before this. Returns
    (totals_by_type, queued_today_by_type)."""
    totals = {}
    queued_today = {}
    today = date.today().isoformat()
    for env in pending_store.iter_pending():
        t = env.get("type", "unknown")
        totals[t] = totals.get(t, 0) + 1
        if env.get("origin", {}).get("submittedAt", "").startswith(today):
            queued_today[t] = queued_today.get(t, 0) + 1
    return totals, queued_today


def source_health_alerts(logs):
    """Source runs from this batch whose status indicates a problem (a source
    down, or HTTP-200-but-zero-parsed schema break) — surfaced loudly so a
    silent rot gets noticed."""
    bad = {"FAILED", "PARSED_ZERO", "NO_TARGETS"}
    return [log for log in logs if log.get("status") in bad]


def generate_digest():
    """Generate a text digest of the weekly scrape."""
    logs = load_scrape_log()
    blog_count, blog_titles = count_new_blog_posts()
    pending_totals, queued_today = summarize_pending()
    alerts = source_health_alerts(logs)

    lines = [
        f"Weekly Scrape Digest — {date.today().isoformat()}",
        "=" * 50,
        "",
    ]

    lines += _alert_lines(alerts)
    lines += _pending_lines(pending_totals, queued_today)
    for log in logs:
        lines += _scraper_lines(log)
    lines += _blog_lines(blog_count, blog_titles)

    if not logs and blog_count == 0:
        lines.append("No new resources or articles were added this week.")
        lines.append("")

    lines.append("—")
    lines.append("The Fullest Project | thefullestproject.org")
    return "\n".join(lines)


def _alert_lines(alerts):
    if not alerts:
        return []
    out = ["!! SOURCE HEALTH ALERTS — a scraper may be broken:"]
    for a in alerts:
        out.append(f"  - {a.get('scraper')}: {a.get('status')} "
                   f"({a.get('targets_succeeded', 0)}/{a.get('targets_attempted', 0)} targets ok, "
                   f"{a.get('entries_found', 0)} parsed)")
    out.append("")
    return out


def _pending_lines(pending_totals, queued_today):
    if not pending_totals:
        return ["Review queue is empty — nothing awaiting approval.", ""]
    out = ["AWAITING REVIEW — approve or reject at https://thefullestproject.org/admin/review/"]
    for t in sorted(pending_totals):
        today_note = f" ({queued_today[t]} new this run)" if queued_today.get(t) else ""
        out.append(f"  {t}: {pending_totals[t]} pending{today_note}")
    out.append("")
    return out


def _scraper_lines(log):
    entries = log.get("entries", [])
    out = [f"Scraper: {log.get('scraper', 'unknown')}",
           f"  Entries processed: {log.get('entries_found', len(entries))}"]
    for entry in entries[:10]:
        name = entry.get("name", entry.get("title", entry.get("slug", "")))
        if name:
            out.append(f"  - [{entry.get('action', '')}] {name}")
    if len(entries) > 10:
        out.append(f"  ... and {len(entries) - 10} more")
    out.append("")
    return out


def _blog_lines(blog_count, blog_titles):
    if blog_count <= 0:
        return []
    out = [f"New Articles: {blog_count}"]
    out += [f"  - {title}" for title in blog_titles]
    out.append("")
    return out


def send_digest(digest_text):
    """Send the digest email via Formspree."""
    import urllib.request

    payload = json.dumps({
        "email": "scraper@thefullestproject.org",
        "_replyto": "info@thefullestproject.org",
        "_subject": f"Weekly Scrape Digest — {date.today().isoformat()}",
        "message": digest_text,
    }).encode("utf-8")

    req = urllib.request.Request(
        FORMSPREE_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status == 200:
                print("Digest email sent successfully")
            else:
                print(f"Digest email response: {response.status}")
    except Exception as e:
        print(f"Warning: Failed to send digest email: {e}")
        print("Digest content (saved to logs instead):")
        print(digest_text)


def run():
    """Generate and send the weekly scrape digest."""
    print("Generating scrape digest...")
    digest = generate_digest()

    # Always save to file
    digest_file = LOG_DIR / "weekly_digest.txt"
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with open(digest_file, "w", encoding="utf-8") as f:
        f.write(digest)
    print(f"Digest saved to {digest_file}")

    # Print to CI logs
    print("\n" + digest)

    # Send via Formspree
    send_digest(digest)


if __name__ == "__main__":
    run()
