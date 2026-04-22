"""
Abilities Expo Vendor Scraper
Fetches vendor/exhibitor listings from the Abilities Expo website.
Categorizes vendors into appropriate resource categories.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from base_scraper import make_resource, save_resources, load_existing, merge_resources


# Keyword-to-category mapping for vendor classification
VENDOR_CATEGORY_KEYWORDS = {
    "wheelchair": ["vehicle-mods", "equipment"],
    "scooter": ["equipment"],
    "ramp": ["home-modifications", "equipment"],
    "lift": ["home-modifications", "vehicle-mods"],
    "prosthetic": ["medical", "equipment"],
    "ortho": ["medical-ortho", "equipment"],
    "therapy": ["therapy"],
    "speech": ["therapy-speech"],
    "hearing": ["hearing"],
    "vision": ["vision"],
    "assistive": ["assistive-tech"],
    "adaptive": ["sports", "recreation"],
    "clothing": ["clothing"],
    "bed": ["equipment", "home-modifications"],
    "bath": ["equipment", "home-modifications"],
    "stair": ["home-modifications"],
    "vehicle": ["vehicle-mods"],
    "van": ["vehicle-mods"],
    "communication": ["assistive-tech"],
    "software": ["assistive-tech"],
    "app": ["assistive-tech"],
    "insurance": ["insurance"],
    "legal": ["legal"],
    "employment": ["employment"],
    "education": ["education"],
    "toy": ["switch-adapted", "recreation"],
    "gaming": ["gaming"],
    "sport": ["sports"],
    "travel": ["recreation", "transportation"],
}


def classify_vendor(name, description=""):
    """Classify a vendor into resource categories based on keywords."""
    text = f"{name} {description}".lower()
    categories = set()
    for keyword, cats in VENDOR_CATEGORY_KEYWORDS.items():
        if keyword in text:
            categories.update(cats)
    return list(categories) if categories else ["equipment"]


def fetch_vendors():
    """Fetch vendor listings from Abilities Expo website."""
    import urllib.request

    # Try the exhibitor/vendor listing page
    urls_to_try = [
        "https://www.abilities.com/exhibitors",
        "https://www.abilities.com/exhibitor-list",
    ]

    html = None
    for url in urls_to_try:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as response:
                html = response.read().decode("utf-8")
            if html and len(html) > 1000:
                print(f"Fetched exhibitor page from {url}")
                break
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
            continue

    if not html:
        print("Could not fetch Abilities Expo vendor page")
        return []

    resources = []
    seen_names = set()

    # Parse vendor entries — look for company names and links
    # Abilities Expo typically lists exhibitors with company name and booth info
    vendor_pattern = re.findall(
        r'<a[^>]*href="(https?://(?!www\.abilities\.com)[^"]+)"[^>]*>([^<]{3,80})</a>',
        html
    )

    for url, name in vendor_pattern:
        name = name.strip()
        if not name or name.lower() in seen_names:
            continue
        # Skip navigation/social links
        skip = ["facebook", "twitter", "instagram", "youtube", "linkedin",
                "google", "mailto:", "javascript:", "#"]
        if any(s in url.lower() for s in skip):
            continue
        seen_names.add(name.lower())

        categories = classify_vendor(name)

        resources.append(make_resource(
            name=name,
            category=categories,
            location="National",
            description=f"Exhibitor at Abilities Expo — the largest disability event in the U.S. Visit their website to learn about their products and services.",
            website=url,
            tags=["abilities-expo", "exhibitor", "disability-products"],
            source="https://www.abilities.com/exhibitors"
        ))

    return resources


def scrape():
    """Main scrape function."""
    print("Fetching Abilities Expo vendor list...")
    vendors = fetch_vendors()

    if not vendors:
        print("No vendors found — using seed data for known exhibitors")
        vendors = seed_vendors()

    print(f"Found {len(vendors)} vendors from Abilities Expo")

    existing = load_existing('national.json')
    merged = merge_resources(existing, vendors)
    save_resources(merged, 'national.json')


def seed_vendors():
    """Seed data for known Abilities Expo vendors if web fetch fails."""
    return [
        make_resource(
            name="Adapt Solutions",
            category=["vehicle-mods", "equipment"],
            location="National",
            description="Manufacturer of wheelchair accessible vehicle conversions and adaptive driving solutions. Abilities Expo exhibitor.",
            website="https://www.adaptsolutions.com",
            tags=["wheelchair-van", "vehicle-conversion", "abilities-expo"],
            source="https://www.abilities.com/"
        ),
        make_resource(
            name="Beds By George",
            category=["equipment", "home-modifications"],
            location="National",
            description="Custom safety beds for children and adults with special needs. Designed for individuals with seizures, mobility issues, or who need containment for safety. Abilities Expo exhibitor.",
            website="https://bedsbygeorge.com",
            tags=["safety-bed", "special-needs", "seizure", "abilities-expo"],
            source="https://www.abilities.com/"
        ),
    ]


if __name__ == "__main__":
    scrape()
