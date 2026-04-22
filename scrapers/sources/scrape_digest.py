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


def generate_digest():
    """Generate a text digest of the weekly scrape."""
    logs = load_scrape_log()
    blog_count, blog_titles = count_new_blog_posts()

    lines = [
        f"Weekly Scrape Digest — {date.today().isoformat()}",
        "=" * 50,
        "",
    ]

    # Summarize scraper activity
    for log in logs:
        scraper = log.get("scraper", "unknown")
        entries = log.get("entries", [])
        count = log.get("entries_found", len(entries))

        lines.append(f"Scraper: {scraper}")
        lines.append(f"  Entries processed: {count}")

        for entry in entries[:10]:
            action = entry.get("action", "")
            name = entry.get("name", entry.get("title", entry.get("slug", "")))
            if name:
                lines.append(f"  - [{action}] {name}")
        if len(entries) > 10:
            lines.append(f"  ... and {len(entries) - 10} more")
        lines.append("")

    # Blog posts
    if blog_count > 0:
        lines.append(f"New Articles: {blog_count}")
        for title in blog_titles:
            lines.append(f"  - {title}")
        lines.append("")

    if not logs and blog_count == 0:
        lines.append("No new resources or articles were added this week.")
        lines.append("")

    lines.append("—")
    lines.append("The Fullest Project | thefullestproject.org")

    return "\n".join(lines)


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
