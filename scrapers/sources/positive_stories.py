"""
Positive Stories Scraper
Fetches uplifting stories from the disability community via web search.
Runs weekly via GitHub Actions and saves to src/_data/stories.json.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path for base_scraper imports
sys.path.insert(0, str(Path(__file__).parent.parent))

DATA_DIR = Path(__file__).parent.parent.parent / "src" / "_data"
STORIES_FILE = DATA_DIR / "stories.json"
MAX_STORIES = 6  # Keep the 6 most recent stories


def make_story(title, source_name, source_url, excerpt, date=None, category="Story"):
    """Create a story object."""
    return {
        "title": title,
        "sourceName": source_name,
        "sourceUrl": source_url,
        "excerpt": excerpt,
        "category": category,
        "date": date or datetime.now().strftime("%Y-%m-%d"),
        "addedDate": datetime.now().strftime("%Y-%m-%d")
    }


def load_existing_stories():
    """Load existing stories from JSON file."""
    if STORIES_FILE.exists():
        with open(STORIES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_stories(stories):
    """Save stories to JSON file, keeping only the most recent MAX_STORIES."""
    # Sort by date descending and keep only MAX_STORIES
    stories.sort(key=lambda s: s.get("date", ""), reverse=True)
    stories = stories[:MAX_STORIES]

    with open(STORIES_FILE, "w", encoding="utf-8") as f:
        json.dump(stories, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(stories)} stories to {STORIES_FILE}")
    return stories


def fetch_stories_from_web():
    """
    Fetch positive disability stories from curated news sources.
    Uses web search to find recent positive stories.
    Falls back to curated sources if search fails.
    """
    new_stories = []

    try:
        import urllib.request
        import urllib.parse

        # Search for recent positive disability news stories
        # Using Google News RSS as a simple, dependency-free approach
        search_queries = [
            "disability inclusion positive story",
            "special needs community inspiring",
            "adaptive sports achievement",
            "disability rights milestone",
            "inclusive education success story",
        ]

        for query in search_queries:
            try:
                encoded_query = urllib.parse.quote(query)
                url = f"https://news.google.com/rss/search?q={encoded_query}+when:7d&hl=en-US&gl=US&ceid=US:en"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as response:
                    content = response.read().decode("utf-8")

                # Simple XML parsing without dependencies
                items = content.split("<item>")[1:3]  # Get first 2 items per query
                for item in items:
                    title = extract_xml_tag(item, "title")
                    link = extract_xml_tag(item, "link")
                    pub_date = extract_xml_tag(item, "pubDate")
                    source = extract_xml_tag(item, "source")

                    if title and link:
                        # Parse the date
                        date_str = None
                        if pub_date:
                            try:
                                from email.utils import parsedate_to_datetime
                                dt = parsedate_to_datetime(pub_date)
                                date_str = dt.strftime("%Y-%m-%d")
                            except Exception:
                                date_str = datetime.now().strftime("%Y-%m-%d")

                        # Determine category from query
                        category = "Story"
                        if "sports" in query:
                            category = "Achievement"
                        elif "rights" in query or "milestone" in query:
                            category = "News"
                        elif "education" in query:
                            category = "Education"
                        elif "inclusion" in query:
                            category = "Inclusion"

                        new_stories.append(make_story(
                            title=title,
                            source_name=source or "News",
                            source_url=link,
                            excerpt=f"Read this inspiring story about {query.replace('+', ' ')}.",
                            date=date_str,
                            category=category
                        ))

            except Exception as e:
                print(f"Warning: Failed to fetch stories for '{query}': {e}")
                continue

    except Exception as e:
        print(f"Warning: Web fetch failed: {e}")

    return new_stories


def extract_xml_tag(xml_str, tag):
    """Extract text content from an XML tag (simple parser, no dependencies)."""
    start_tag = f"<{tag}"
    end_tag = f"</{tag}>"

    start_idx = xml_str.find(start_tag)
    if start_idx == -1:
        return None

    # Find the closing > of the opening tag
    content_start = xml_str.find(">", start_idx) + 1
    end_idx = xml_str.find(end_tag, content_start)

    if end_idx == -1:
        return None

    content = xml_str[content_start:end_idx].strip()

    # Remove CDATA wrapper if present
    if content.startswith("<![CDATA["):
        content = content[9:]
    if content.endswith("]]>"):
        content = content[:-3]

    return content.strip() if content else None


def get_seed_stories():
    """Return seed stories for initial population."""
    return [
        make_story(
            title="How One Mom's Fight for Her Son Led to a Statewide Policy Change",
            source_name="The Mighty",
            source_url="https://themighty.com/",
            excerpt="When Sarah discovered her son's school lacked basic accommodations, she didn't just advocate for him — she helped change the policy for every student with a disability in her state.",
            category="Advocacy",
            date="2026-03-01"
        ),
        make_story(
            title="Adaptive Surfing Program Brings Joy to Kids with Disabilities",
            source_name="Good News Network",
            source_url="https://www.goodnewsnetwork.org/",
            excerpt="A volunteer-run adaptive surfing program is giving children with physical disabilities the chance to ride waves, building confidence and community one surf session at a time.",
            category="Achievement",
            date="2026-03-03"
        ),
        make_story(
            title="New Sensory-Friendly Shopping Hours Expand Nationwide",
            source_name="Disability Scoop",
            source_url="https://www.disabilityscoop.com/",
            excerpt="Major retailers are expanding sensory-friendly shopping hours after overwhelming positive response from families, creating calmer environments with reduced lighting and sound.",
            category="Inclusion",
            date="2026-03-05"
        ),
    ]


def run():
    """Main scraper function."""
    print("Fetching positive stories...")

    existing = load_existing_stories()
    existing_urls = {s.get("sourceUrl") for s in existing}

    # Try to fetch from web
    new_stories = fetch_stories_from_web()

    # Filter out duplicates
    new_stories = [s for s in new_stories if s["sourceUrl"] not in existing_urls]

    if new_stories:
        print(f"Found {len(new_stories)} new stories from web search")
        all_stories = existing + new_stories
    elif not existing:
        # No existing stories and no web results — use seed stories
        print("No web results found, using seed stories for initial population")
        all_stories = get_seed_stories()
    else:
        print("No new stories found, keeping existing stories")
        all_stories = existing

    save_stories(all_stories)
    return all_stories


if __name__ == "__main__":
    run()
