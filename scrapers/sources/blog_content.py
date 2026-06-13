"""
Blog Content Scraper
Fetches disability community stories and generates Markdown blog posts.
Runs weekly via GitHub Actions.
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pending_store
from base_scraper import load_blocklist

BLOG_DIR = Path(__file__).parent.parent.parent / "src" / "blog"
LOG_DIR = Path(__file__).parent.parent / "logs"
MAX_NEW_PER_RUN = 3

# Quality filters — reject articles that match these patterns
BLOCKED_DOMAINS = {
    "neowin.net", "tradersunion.com", "solutionsreview.com",
    "benzinga.com", "fool.com", "investopedia.com",
    "cointelegraph.com", "coindesk.com", "techradar.com",
    "pcmag.com", "tomsguide.com", "zdnet.com",
}

BLOCKED_TITLE_KEYWORDS = [
    "stock", "trading", "forex", "crypto", "bitcoin", "pest control",
    "subscription", "coupon", "discount", "investment", "backup day",
    "black friday", "cyber monday", "prime day", "deal alert",
    "save on", "save %", "lifetime subscription", "vpn deal",
]

REQUIRED_RELEVANCE_KEYWORDS = [
    "disability", "disabled", "caregiver", "caregiving", "accessibility",
    "accessible", "adaptive", "inclusion", "inclusive", "special needs",
    "assistive", "wheelchair", "autism", "iep", "504 plan",
    "sensory", "therapy", "rehabilitation", "prosthetic",
    "deaf", "blind", "cerebral palsy", "down syndrome",
]


def slugify(text):
    """Convert text to a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text[:60].rstrip('-')


def existing_post_slugs():
    """Get slugs of existing blog posts."""
    slugs = set()
    if BLOG_DIR.exists():
        for f in BLOG_DIR.glob("*.md"):
            slugs.add(f.stem.lower())
    return slugs


def write_log(scraper_name, entries):
    """Append scraper run to log file."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / "scrape_log.json"

    existing_logs = []
    if log_file.exists():
        try:
            with open(log_file, "r", encoding="utf-8") as f:
                existing_logs = json.load(f)
        except (json.JSONDecodeError, ValueError):
            existing_logs = []

    log_entry = {
        "scraper": scraper_name,
        "timestamp": datetime.now().isoformat(),
        "entries_found": len(entries),
        "entries": entries
    }
    existing_logs.append(log_entry)
    existing_logs = existing_logs[-50:]

    with open(log_file, "w", encoding="utf-8") as f:
        json.dump(existing_logs, f, indent=2, ensure_ascii=False)

    print(f"Logged {len(entries)} entries to {log_file}")


def extract_xml_tag(xml_str, tag):
    """Extract text content from an XML tag."""
    start_tag = f"<{tag}"
    end_tag = f"</{tag}>"
    start_idx = xml_str.find(start_tag)
    if start_idx == -1:
        return None
    content_start = xml_str.find(">", start_idx) + 1
    end_idx = xml_str.find(end_tag, content_start)
    if end_idx == -1:
        return None
    content = xml_str[content_start:end_idx].strip()
    if content.startswith("<![CDATA["):
        content = content[9:]
    if content.endswith("]]>"):
        content = content[:-3]
    return content.strip() if content else None


def fetch_articles():
    """Fetch articles from Google News RSS."""
    articles = []

    try:
        import urllib.request
        import urllib.parse

        search_queries = [
            ("caregiver tips disability practical advice", "Caregiver Tips"),
            ("disability community expert insights", "Expert Insights"),
            ("adaptive technology review disability", "Adaptive Technology"),
            ("inclusive education success practical guide", "Education"),
            ("disability family support resources new", "Resources"),
        ]

        for query, category in search_queries:
            try:
                encoded_query = urllib.parse.quote(query)
                url = f"https://news.google.com/rss/search?q={encoded_query}+when:7d&hl=en-US&gl=US&ceid=US:en"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as response:
                    content = response.read().decode("utf-8")

                items = content.split("<item>")[1:2]  # First item per query
                for item in items:
                    title = extract_xml_tag(item, "title")
                    link = extract_xml_tag(item, "link")
                    source = extract_xml_tag(item, "source") or "News"
                    pub_date = extract_xml_tag(item, "pubDate")

                    if title and link:
                        date_str = datetime.now().strftime("%Y-%m-%d")
                        if pub_date:
                            try:
                                from email.utils import parsedate_to_datetime
                                dt = parsedate_to_datetime(pub_date)
                                date_str = dt.strftime("%Y-%m-%d")
                            except Exception:
                                pass

                        articles.append({
                            "title": title,
                            "source": source,
                            "url": link,
                            "date": date_str,
                            "category": category
                        })

            except Exception as e:
                print(f"Warning: Failed to fetch for '{query}': {e}")
                continue

    except Exception as e:
        print(f"Warning: Web fetch failed: {e}")

    return articles


def create_blog_post(article):
    """Generate a Markdown blog post file from an article.

    NOTE: not called during scheduled scrapes anymore — article candidates are
    queued to pending/ and the canonical .md generator is renderBlogMarkdown()
    in the tfp-admin-api worker, which runs at approval time. Retained for
    manual/local use; keep the front-matter template in sync with the worker.
    """
    slug = slugify(article["title"])
    filepath = BLOG_DIR / f"{slug}.md"

    date_str = article["date"]
    source = article["source"]
    title_escaped = article["title"].replace('"', '\\"')

    front_matter = f"""---
layout: layouts/post.njk
title: "{title_escaped}"
date: {date_str}
author: "via {source}"
category: "{article['category']}"
excerpt: "Curated from {source} — read the original article for the full story."
sourceUrl: "{article['url']}"
autoGenerated: true
tags:
  - curated
  - {article['category'].lower().replace(' ', '-')}
---

"""

    body = f"""*This article was curated from [{source}]({article['url']}). Visit the original source for the full story.*

## {article['title']}

This article from {source} covers topics relevant to the disability community, including {article['category'].lower()}. We've highlighted it here because we believe it offers valuable information for caregivers and families.

[Read the full article at {source}]({article['url']})

---

*Know of a great article or resource we should feature? [Submit it here](/submit-resource/) or use our [Quick Submit tool](/quick-submit/).*
"""

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(front_matter + body)

    print(f"Created blog post: {filepath.name}")
    return slug


def _passes_quality_filters(article):
    """Apply the blocked-domain / blocked-keyword / relevance filters."""
    article_url = article.get("url", "").lower()
    if any(domain in article_url for domain in BLOCKED_DOMAINS):
        print(f"Skipping blocked domain: {article['title']}")
        return False

    title_lower = article["title"].lower()
    if any(kw in title_lower for kw in BLOCKED_TITLE_KEYWORDS):
        print(f"Skipping blocked keyword: {article['title']}")
        return False

    if not any(kw in title_lower for kw in REQUIRED_RELEVANCE_KEYWORDS):
        print(f"Skipping irrelevant (no disability keyword): {article['title']}")
        return False

    return True


def run():
    """Main scraper function.

    Article candidates are queued to pending/ for admin review; the .md post
    is generated by the admin worker at approval time. No files are written
    to src/blog/ during the scrape.
    """
    print("Fetching blog content...")

    existing_slugs = existing_post_slugs()
    pending_keys = pending_store.load_pending_keys("blog")  # urls and slugs
    blocklist = load_blocklist()
    articles = fetch_articles()

    log_entries = []
    queued_articles = []

    for article in articles:
        if len(queued_articles) >= MAX_NEW_PER_RUN:
            break

        slug = slugify(article["title"])
        if slug in existing_slugs:
            print(f"Skipping duplicate: {slug}")
            continue
        if slug in pending_keys or article["url"] in pending_keys:
            print(f"Skipping already queued: {slug}")
            continue
        if article["url"] in blocklist.get("urls", []) or article["title"] in blocklist.get("names", []):
            print(f"Skipping rejected (blocklisted): {article['title']}")
            continue
        if not _passes_quality_filters(article):
            continue

        article["slug"] = slug
        queued_articles.append(article)
        existing_slugs.add(slug)

        log_entries.append({
            "action": "queued",
            "title": article["title"],
            "source": article["source"],
            "slug": slug
        })

    if queued_articles:
        envelopes = [pending_store.make_envelope("blog", a, "blog_content")
                     for a in queued_articles]
        pending_store.queue_items("blog", envelopes)

    if not log_entries:
        log_entries.append({"action": "no_new_posts"})

    write_log("blog_content", log_entries)
    print(f"Queued {len(queued_articles)} blog article candidates for review")


if __name__ == "__main__":
    run()
