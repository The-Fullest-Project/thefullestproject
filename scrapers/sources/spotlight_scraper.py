"""
Spotlight Scraper
Auto-discovers accessible service organizations via web search.
Runs weekly via GitHub Actions and saves to src/_data/spotlights.json.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

DATA_DIR = Path(__file__).parent.parent.parent / "src" / "_data"
SPOTLIGHTS_FILE = DATA_DIR / "spotlights.json"
LOG_DIR = Path(__file__).parent.parent / "logs"
MAX_NEW_PER_RUN = 3

# Category-to-thumbnail mapping
CATEGORY_THUMBNAILS = {
    "adventures": "/images/spotlights/adventures.svg",
    "sports": "/images/spotlights/sports.svg",
    "education": "/images/spotlights/education.svg",
    "community": "/images/spotlights/community.svg",
}
DEFAULT_THUMBNAIL = "/images/spotlights/general.svg"


def make_spotlight(name, description, category, website, instagram="", facebook="", location="National", tags=None):
    """Create a spotlight object."""
    cat_key = category.lower()
    return {
        "name": name,
        "description": description,
        "category": category,
        "website": website,
        "socialLinks": {
            "instagram": instagram,
            "facebook": facebook
        },
        "thumbnail": CATEGORY_THUMBNAILS.get(cat_key, DEFAULT_THUMBNAIL),
        "location": location,
        "tags": tags or [],
        "featured": False,
        "date": datetime.now().strftime("%Y-%m-%d")
    }


def load_existing():
    """Load existing spotlights from JSON file."""
    if SPOTLIGHTS_FILE.exists():
        with open(SPOTLIGHTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_spotlights(spotlights, log_entries=None):
    """Save spotlights to JSON file."""
    spotlights.sort(key=lambda s: s.get("date", ""), reverse=True)

    with open(SPOTLIGHTS_FILE, "w", encoding="utf-8") as f:
        json.dump(spotlights, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(spotlights)} spotlights to {SPOTLIGHTS_FILE}")

    # Write log
    if log_entries:
        write_log("spotlight_scraper", log_entries)


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

    # Keep last 50 log entries
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


def fetch_spotlights_from_web():
    """Fetch accessible service organizations from news sources."""
    new_spotlights = []

    try:
        import urllib.request
        import urllib.parse

        search_queries = [
            ("adaptive adventures program disability", "Adventures"),
            ("accessible recreation nonprofit launch", "Adventures"),
            ("disability inclusive services organization new", "Community"),
            ("adaptive sports program disability", "Sports"),
            ("accessible education program disability", "Education"),
        ]

        for query, category in search_queries:
            try:
                encoded_query = urllib.parse.quote(query)
                url = f"https://news.google.com/rss/search?q={encoded_query}+when:30d&hl=en-US&gl=US&ceid=US:en"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as response:
                    content = response.read().decode("utf-8")

                items = content.split("<item>")[1:2]  # Get first item per query
                for item in items:
                    title = extract_xml_tag(item, "title")
                    link = extract_xml_tag(item, "link")
                    source = extract_xml_tag(item, "source")

                    if title and link:
                        # Extract a potential organization name from title
                        org_name = title.split(":")[0].strip() if ":" in title else title[:60].strip()

                        new_spotlights.append(make_spotlight(
                            name=org_name,
                            description=title,
                            category=category,
                            website=link,
                            tags=[category.lower(), "auto-discovered"]
                        ))

            except Exception as e:
                print(f"Warning: Failed to fetch for '{query}': {e}")
                continue

    except Exception as e:
        print(f"Warning: Web fetch failed: {e}")

    return new_spotlights


def run():
    """Main scraper function."""
    print("Discovering accessible service organizations...")

    existing = load_existing()
    existing_names = {s.get("name", "").lower().strip() for s in existing}

    new_spotlights = fetch_spotlights_from_web()

    # Filter duplicates by name
    new_spotlights = [s for s in new_spotlights if s["name"].lower().strip() not in existing_names]

    # Limit new additions
    new_spotlights = new_spotlights[:MAX_NEW_PER_RUN]

    log_entries = []

    if new_spotlights:
        print(f"Found {len(new_spotlights)} new spotlights")

        # Rotate featured: unfeatured all existing, feature the newest
        for s in existing:
            s["featured"] = False
        new_spotlights[0]["featured"] = True

        all_spotlights = new_spotlights + existing

        for s in new_spotlights:
            log_entries.append({
                "action": "added",
                "name": s["name"],
                "category": s["category"],
                "website": s["website"]
            })
    else:
        print("No new spotlights found")
        all_spotlights = existing
        log_entries.append({"action": "no_new_found"})

    save_spotlights(all_spotlights, log_entries)
    return all_spotlights


if __name__ == "__main__":
    run()
