"""
Scraper for Northern Virginia disability resources across all categories.
Uses scrapling to fetch and parse resource directories.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from base_scraper import make_resource, save_resources, load_existing, merge_resources

try:
    from scrapling import Fetcher
    HAS_SCRAPLING = True
except ImportError:
    HAS_SCRAPLING = False
    print("WARNING: scrapling not installed. Using seed data only.")


# Known resource directories to scrape
SOURCES = {
    "early-intervention": [
        {
            "url": "https://www.infantva.org/",
            "name": "Virginia Early Intervention (Infant & Toddler Connection)",
            "description": "Virginia's early intervention system for infants and toddlers (birth to age 3) with developmental delays or disabilities. Free evaluation and services.",
        },
        {
            "url": "https://www.fairfaxcounty.gov/office-for-children/early-intervention",
            "name": "Fairfax County Early Intervention",
            "description": "Early intervention services for children birth to 3 in Fairfax County through the Infant & Toddler Connection.",
        },
    ],
    "transition": [
        {
            "url": "https://www.dars.virginia.gov/",
            "name": "Virginia Department for Aging and Rehabilitative Services (DARS)",
            "description": "Vocational rehabilitation and transition services for youth and adults with disabilities in Virginia.",
        },
        {
            "url": "https://www.servicesfource.org/",
            "name": "ServiceSource",
            "description": "Non-profit helping people with disabilities achieve employment, independence, and integration through vocational training and job placement.",
        },
    ],
    "financial": [
        {
            "url": "https://www.ssa.gov/benefits/disability/",
            "name": "Social Security Disability Benefits (SSI/SSDI)",
            "description": "Federal disability benefits including Supplemental Security Income (SSI) and Social Security Disability Insurance (SSDI).",
        },
        {
            "url": "https://www.dmas.virginia.gov/",
            "name": "Virginia Medicaid (DMAS)",
            "description": "Virginia's Medicaid program including waiver programs for individuals with disabilities, covering therapies, equipment, and personal care.",
        },
        {
            "url": "https://www.ablenrc.org/",
            "name": "ABLE National Resource Center",
            "description": "Information about ABLE accounts — tax-advantaged savings accounts for individuals with disabilities that don't affect benefits eligibility.",
        },
    ],
    "insurance": [
        {
            "url": "https://www.cms.gov/cciio/resources/consumer-assistance-grants",
            "name": "Healthcare.gov - Appeals & Grievances",
            "description": "Federal resource for understanding your rights when insurance denies coverage, including how to file appeals for therapies and equipment.",
        },
    ],
    "planning": [
        {
            "url": "https://www.specialneedsalliance.org/",
            "name": "Special Needs Alliance",
            "description": "National network of attorneys specializing in special needs planning, including special needs trusts, guardianship, and estate planning.",
        },
        {
            "url": "https://www.thearcofnova.org/programs/trusts/",
            "name": "The Arc of NoVA - Pooled Trust",
            "description": "Pooled special needs trust program through The Arc of Northern Virginia for individuals with disabilities.",
        },
    ],
    "mental-health": [
        {
            "url": "https://www.nami.org/find-support/",
            "name": "NAMI - National Alliance on Mental Illness",
            "description": "Mental health support, education, and advocacy. Includes support groups for caregivers and individuals with disabilities.",
        },
        {
            "url": "https://www.fairfaxcounty.gov/community-services-board/",
            "name": "Fairfax-Falls Church Community Services Board",
            "description": "Mental health, substance use, and developmental disability services for Fairfax County residents.",
        },
    ],
    "transportation": [
        {
            "url": "https://www.fairfaxcounty.gov/neighborhood-community-services/transportation",
            "name": "Fairfax County FASTRAN",
            "description": "Accessible transportation services for Fairfax County residents with disabilities who cannot use regular public transit.",
        },
        {
            "url": "https://www.wmata.com/service/accessibility/",
            "name": "WMATA MetroAccess",
            "description": "Paratransit service for people with disabilities who cannot use regular Metro bus or rail in the DC metro area.",
        },
    ],
    "housing": [
        {
            "url": "https://www.fairfaxcounty.gov/housing/",
            "name": "Fairfax County Housing & Community Development",
            "description": "Accessible and affordable housing resources, including Section 8 vouchers and housing for people with disabilities.",
        },
        {
            "url": "https://endhomelessness.org/",
            "name": "National Alliance to End Homelessness",
            "description": "Resources and advocacy for housing solutions including accessible housing for individuals with disabilities.",
        },
    ],
    "medical": [
        {
            "url": "https://www.childrensnational.org/",
            "name": "Children's National Hospital",
            "description": "Comprehensive pediatric medical center with specialty clinics for children with disabilities and complex medical needs.",
        },
        {
            "url": "https://www.inova.org/our-services/pediatrics",
            "name": "Inova Children's Hospital",
            "description": "Pediatric services including developmental pediatrics, neurology, and rehabilitation for children with disabilities in Northern Virginia.",
        },
    ],
    "camps": [
        {
            "url": "https://www.fairfaxcounty.gov/neighborhood-community-services/therapeutic-recreation/camps",
            "name": "Fairfax County Therapeutic Recreation Camps",
            "description": "Summer and seasonal camps for children and teens with disabilities through Fairfax County Therapeutic Recreation.",
        },
        {
            "url": "https://www.campbaker.org/",
            "name": "Camp Baker (The Arc of NoVA)",
            "description": "Residential summer camp for teens and adults with intellectual and developmental disabilities.",
        },
    ],
    "sibling-support": [
        {
            "url": "https://siblingsupport.org/",
            "name": "Sibling Support Project (Sibshops)",
            "description": "National program providing peer support and education for brothers and sisters of people with special health, developmental, and mental health concerns.",
        },
    ],
    "assistive-tech": [
        {
            "url": "https://www.at3center.net/",
            "name": "Assistive Technology Act Programs",
            "description": "National network providing assistive technology information, device demonstrations, and lending programs in every state.",
        },
        {
            "url": "https://vats.org/",
            "name": "Virginia Assistive Technology System (VATS)",
            "description": "Virginia's AT Act program providing device demonstrations, short-term loans, and information about assistive technology.",
        },
    ],
    "sports": [
        {
            "url": "https://www.specialolympicsva.org/",
            "name": "Special Olympics Virginia",
            "description": "Year-round sports training and competitions for children and adults with intellectual disabilities.",
        },
        {
            "url": "https://bfreinc.org/",
            "name": "BlazeSports America",
            "description": "Adaptive sports and recreation programs for youth and adults with physical disabilities.",
        },
    ],
    "emergency": [
        {
            "url": "https://www.ready.gov/disability",
            "name": "Ready.gov - People with Disabilities",
            "description": "Federal emergency preparedness resources specifically for individuals with disabilities and their caregivers.",
        },
    ],
    "home-modifications": [
        {
            "url": "https://www.rebuildingtogether.org/",
            "name": "Rebuilding Together",
            "description": "Non-profit providing free home modifications and accessibility improvements for people with disabilities and aging adults.",
        },
    ],
}


def scrape():
    """Scrape and compile Northern Virginia resources for new categories."""
    scraped = []

    for category, sources in SOURCES.items():
        for src in sources:
            # Determine location based on URL content
            url = src["url"].lower()
            if any(kw in url for kw in ["fairfax", "virginia", "nova", "inova"]):
                location = "Northern Virginia"
            elif "national" in src.get("name", "").lower() or not any(
                kw in url for kw in ["fairfax", "virginia", "nova", ".va."]
            ):
                location = "National"
            else:
                location = "Northern Virginia"

            resource = make_resource(
                name=src["name"],
                category=[category],
                location=location,
                description=src["description"],
                website=src["url"],
                source=src["url"],
                tags=[category],
            )
            scraped.append(resource)

    # If scrapling is available, try to enrich data from live pages
    if HAS_SCRAPLING:
        fetcher = Fetcher(auto_match=False)
        for resource in scraped:
            if not resource["website"]:
                continue
            try:
                page = fetcher.get(resource["website"])
                # Try to extract phone numbers
                phone_el = page.css('a[href^="tel:"]')
                if phone_el:
                    resource["phone"] = phone_el[0].text.strip()
                # Try to extract address
                addr_el = page.css('address') or page.css('[itemprop="address"]')
                if addr_el:
                    resource["address"] = addr_el[0].text.strip()
            except Exception as e:
                print(f"  Could not enrich {resource['name']}: {e}")

    # Merge with existing nova.json (preserves all current data)
    existing = load_existing('nova.json')
    merged = merge_resources(existing, scraped)
    save_resources(merged, 'nova.json')

    print(f"  Added/updated {len(scraped)} resources across {len(SOURCES)} new categories")


if __name__ == '__main__':
    scrape()
