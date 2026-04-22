"""
Medically Complex Caregiver Resource Scraper
Fetches resources from medicallycomplexcaregiver.com/resourcebycondition.
Maps conditions to resource categories.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from base_scraper import make_resource, save_resources, load_existing, merge_resources


SOURCE_URL = "https://www.medicallycomplexcaregiver.com/resourcebycondition"

# Map condition categories to our resource categories
CONDITION_TO_CATEGORY = {
    "autism": ["medical", "community"],
    "cerebral palsy": ["medical", "community"],
    "down syndrome": ["medical", "community"],
    "epilepsy": ["medical"],
    "rare disease": ["medical", "caregiver-support"],
    "hearing loss": ["hearing"],
    "vision": ["vision"],
    "mental health": ["mental-health"],
    "feeding": ["therapy-feeding", "nutrition"],
    "respiratory": ["medical"],
    "cardiac": ["medical"],
    "genetic": ["medical-genetics"],
    "neurological": ["medical-neuro"],
    "orthopedic": ["medical-ortho"],
}


def condition_to_categories(condition_text):
    """Map a condition string to resource category slugs."""
    text = condition_text.lower()
    for keyword, cats in CONDITION_TO_CATEGORY.items():
        if keyword in text:
            return cats
    return ["medical", "caregiver-support"]


def fetch_resources():
    """Fetch resources from medicallycomplexcaregiver.com."""
    import urllib.request

    req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            html = response.read().decode("utf-8")
    except Exception as e:
        print(f"Failed to fetch MedicallyComplexCaregiver: {e}")
        return []

    resources = []

    # Parse resource links from the page
    # Look for <a> tags with resource names and URLs
    # Pattern: links within content area pointing to external resources
    link_pattern = re.findall(
        r'<a[^>]*href="(https?://(?!www\.medicallycomplexcaregiver\.com)[^"]+)"[^>]*>([^<]+)</a>',
        html
    )

    seen_urls = set()
    for url, name in link_pattern:
        name = name.strip()
        url = url.strip()

        # Skip common non-resource links
        if not name or len(name) < 3:
            continue
        skip_domains = ["facebook.com", "twitter.com", "instagram.com", "youtube.com",
                        "linkedin.com", "google.com", "amazon.com", "apple.com"]
        if any(d in url.lower() for d in skip_domains):
            continue
        if url in seen_urls:
            continue
        seen_urls.add(url)

        # Try to determine condition context from surrounding HTML
        categories = ["medical", "caregiver-support"]

        resources.append(make_resource(
            name=name,
            category=categories,
            location="National",
            description=f"Resource from Medically Complex Caregiver resource guide. Visit their website for condition-specific information and support.",
            website=url,
            tags=["medically-complex", "caregiver-resource"],
            source=SOURCE_URL
        ))

    return resources


def scrape():
    """Main scrape function."""
    print("Fetching resources from medicallycomplexcaregiver.com...")
    resources = fetch_resources()

    if not resources:
        print("No resources found — using seed data")
        resources = seed_resources()

    print(f"Found {len(resources)} resources from MedicallyComplexCaregiver")

    existing = load_existing('national.json')
    merged = merge_resources(existing, resources)
    save_resources(merged, 'national.json')


def seed_resources():
    """Seed data if web fetch fails."""
    return [
        make_resource(
            name="Medically Complex Caregiver",
            category=["caregiver-support"],
            location="National",
            description="Comprehensive resource hub for caregivers of medically complex children. Provides condition-specific resource directories, caregiver guides, and community support.",
            website="https://www.medicallycomplexcaregiver.com",
            tags=["caregiver", "medically-complex", "resource-guide"],
            source="https://www.medicallycomplexcaregiver.com"
        ),
    ]


if __name__ == "__main__":
    scrape()
