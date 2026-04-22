"""
MobilityWorks Location Scraper
Fetches wheelchair accessible vehicle dealer locations from mobilityworks.com.
Adds each location as a vehicle-mods resource with state-based location.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from base_scraper import make_resource, save_resources, load_existing, merge_resources


# US state name → abbreviation mapping for location normalization
STATE_ABBREV = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
}


def abbrev_to_state(abbrev):
    """Convert state abbreviation to full name."""
    return STATE_ABBREV.get(abbrev.upper(), abbrev)


def fetch_locations():
    """Fetch MobilityWorks location data from their website."""
    import urllib.request

    url = "https://www.mobilityworks.com/locations/"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            html = response.read().decode("utf-8")
    except Exception as e:
        print(f"Failed to fetch MobilityWorks locations: {e}")
        return []

    resources = []

    # Parse location entries from HTML
    # MobilityWorks location pages typically list locations with city, state, phone, address
    # Try to find JSON-LD or structured data first
    json_ld_pattern = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
    for block in json_ld_pattern:
        try:
            data = json.loads(block)
            if isinstance(data, list):
                for item in data:
                    if item.get("@type") in ("LocalBusiness", "Store", "AutoDealer"):
                        resources.append(parse_jsonld_location(item))
            elif isinstance(data, dict) and data.get("@type") in ("LocalBusiness", "Store", "AutoDealer"):
                resources.append(parse_jsonld_location(data))
        except (json.JSONDecodeError, KeyError):
            continue

    if resources:
        return [r for r in resources if r is not None]

    # Fallback: parse HTML links matching location pattern
    location_links = re.findall(
        r'href="(https://www\.mobilityworks\.com/[^"]*locations/[^"]+)"[^>]*>([^<]+)</a>',
        html
    )

    seen = set()
    for link, name in location_links:
        name = name.strip()
        if not name or name.lower() in ("locations", "find a location", "view all"):
            continue
        if link in seen:
            continue
        seen.add(link)

        # Try to extract state from URL or name
        # URLs like /locations/virginia/fairfax/
        parts = link.rstrip("/").split("/")
        state_name = ""
        city_name = name
        if len(parts) >= 5:
            state_name = parts[-2].replace("-", " ").title()
            city_name = parts[-1].replace("-", " ").title()

        if not state_name:
            state_name = "National"

        resources.append(make_resource(
            name=f"MobilityWorks - {city_name}",
            category=["vehicle-mods"],
            location=state_name,
            area=city_name.lower(),
            description=f"MobilityWorks wheelchair accessible vehicle dealer in {city_name}, {state_name}. Sales, service, and rentals of wheelchair vans and adaptive driving equipment.",
            website=link,
            tags=["wheelchair-van", "accessible-vehicle", "dealer", "mobility"],
            source="https://www.mobilityworks.com/locations/"
        ))

    return resources


def parse_jsonld_location(item):
    """Parse a JSON-LD LocalBusiness entry into a resource."""
    try:
        name = item.get("name", "MobilityWorks")
        address = item.get("address", {})
        city = address.get("addressLocality", "")
        state = address.get("addressRegion", "")
        street = address.get("streetAddress", "")
        zipcode = address.get("postalCode", "")
        phone = item.get("telephone", "")
        url = item.get("url", "https://www.mobilityworks.com/")

        state_full = abbrev_to_state(state) if len(state) == 2 else state

        full_address = ", ".join(filter(None, [street, city, state, zipcode]))

        return make_resource(
            name=f"MobilityWorks - {city}" if city else name,
            category=["vehicle-mods"],
            location=state_full,
            area=city.lower() if city else "",
            description=f"MobilityWorks wheelchair accessible vehicle dealer. Sales, service, and rentals of wheelchair vans and adaptive driving equipment.",
            website=url,
            phone=phone,
            address=full_address,
            tags=["wheelchair-van", "accessible-vehicle", "dealer", "mobility"],
            source="https://www.mobilityworks.com/locations/"
        )
    except Exception as e:
        print(f"Failed to parse JSON-LD location: {e}")
        return None


def scrape():
    """Main scrape function."""
    print("Fetching MobilityWorks locations...")
    locations = fetch_locations()

    if not locations:
        print("No locations found — using seed data for key locations")
        locations = seed_locations()

    print(f"Found {len(locations)} MobilityWorks locations")

    # Save to national.json (merge)
    existing = load_existing('national.json')
    merged = merge_resources(existing, locations)
    save_resources(merged, 'national.json')


def seed_locations():
    """Seed data for key MobilityWorks locations if web fetch fails."""
    return [
        make_resource(
            name="MobilityWorks - Fairfax",
            category=["vehicle-mods"],
            location="Virginia",
            area="fairfax",
            description="MobilityWorks wheelchair accessible vehicle dealer. Sales, service, and rentals of wheelchair vans and adaptive driving equipment.",
            website="https://www.mobilityworks.com/virginia/fairfax/",
            phone="",
            address="Fairfax, VA",
            tags=["wheelchair-van", "accessible-vehicle", "dealer", "mobility"],
            source="https://www.mobilityworks.com/locations/"
        ),
        make_resource(
            name="MobilityWorks - Sterling",
            category=["vehicle-mods"],
            location="Virginia",
            area="sterling",
            description="MobilityWorks wheelchair accessible vehicle dealer. Sales, service, and rentals of wheelchair vans and adaptive driving equipment.",
            website="https://www.mobilityworks.com/virginia/sterling/",
            phone="",
            address="Sterling, VA",
            tags=["wheelchair-van", "accessible-vehicle", "dealer", "mobility"],
            source="https://www.mobilityworks.com/locations/"
        ),
    ]


if __name__ == "__main__":
    scrape()
