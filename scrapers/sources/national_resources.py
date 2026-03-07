"""
Scraper for national disability resources across all categories.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from base_scraper import make_resource, save_resources, load_existing, merge_resources


NATIONAL_SOURCES = {
    "early-intervention": [
        {
            "url": "https://ectacenter.org/",
            "name": "Early Childhood Technical Assistance Center (ECTA)",
            "description": "National resource center for early intervention and early childhood special education programs.",
        },
        {
            "url": "https://www.cdc.gov/ncbddd/actearly/",
            "name": "CDC - Learn the Signs. Act Early.",
            "description": "Free developmental milestone resources, checklists, and tips for parents to track their child's development from 2 months to 5 years.",
        },
    ],
    "transition": [
        {
            "url": "https://www.pacer.org/transition/",
            "name": "PACER Center - Transition Resources",
            "description": "Comprehensive transition planning resources for youth with disabilities moving from school to adult life.",
        },
        {
            "url": "https://thinkcollege.net/",
            "name": "Think College",
            "description": "National resource for college options for people with intellectual disabilities, including program search and planning tools.",
        },
    ],
    "financial": [
        {
            "url": "https://www.ssa.gov/benefits/disability/",
            "name": "Social Security Disability Benefits (SSI/SSDI)",
            "description": "Federal disability benefits including Supplemental Security Income (SSI) and Social Security Disability Insurance (SSDI).",
        },
        {
            "url": "https://www.ablenrc.org/",
            "name": "ABLE National Resource Center",
            "description": "Information about ABLE accounts — tax-advantaged savings accounts for individuals with disabilities.",
        },
        {
            "url": "https://www.ndrn.org/",
            "name": "National Disability Rights Network",
            "description": "Largest provider of legally based advocacy services for people with disabilities in the US.",
        },
    ],
    "insurance": [
        {
            "url": "https://familyvoices.org/",
            "name": "Family Voices",
            "description": "National network helping families navigate healthcare and insurance systems for children with special health care needs.",
        },
    ],
    "planning": [
        {
            "url": "https://www.specialneedsalliance.org/",
            "name": "Special Needs Alliance",
            "description": "National network of attorneys specializing in special needs trusts, guardianship, estate planning, and benefits preservation.",
        },
    ],
    "mental-health": [
        {
            "url": "https://www.nami.org/",
            "name": "NAMI - National Alliance on Mental Illness",
            "description": "Mental health support, education, and advocacy including support groups for caregivers.",
        },
        {
            "url": "https://www.caregiveraction.org/",
            "name": "Caregiver Action Network",
            "description": "Support and resources specifically for family caregivers, including mental health resources and peer support.",
        },
    ],
    "transportation": [
        {
            "url": "https://www.nadtc.org/",
            "name": "National Aging and Disability Transportation Center",
            "description": "Resources for accessible transportation options across the country for people with disabilities and older adults.",
        },
    ],
    "housing": [
        {
            "url": "https://www.hud.gov/program_offices/fair_housing_equal_opp/disability_overview",
            "name": "HUD - Fair Housing & Disability",
            "description": "Federal resources on housing rights for people with disabilities, reasonable accommodations, and accessibility requirements.",
        },
    ],
    "medical": [
        {
            "url": "https://palfreyassociates.com/disability-friendly-doctor/",
            "name": "Finding Disability-Friendly Doctors",
            "description": "Guide to finding medical providers who are experienced with and accessible to patients with disabilities.",
        },
    ],
    "camps": [
        {
            "url": "https://www.acacamps.org/campers-families/find-a-camp",
            "name": "American Camp Association - Find a Camp",
            "description": "Searchable database of accredited camps including camps for children with special needs and disabilities.",
        },
    ],
    "sibling-support": [
        {
            "url": "https://siblingsupport.org/",
            "name": "Sibling Support Project (Sibshops)",
            "description": "National program providing peer support for brothers and sisters of people with special needs. Includes Sibshops workshops.",
        },
        {
            "url": "https://www.siblingleadership.org/",
            "name": "Sibling Leadership Network",
            "description": "National network providing information, support, and tools for siblings of individuals with disabilities.",
        },
    ],
    "assistive-tech": [
        {
            "url": "https://www.at3center.net/",
            "name": "Assistive Technology Act Programs",
            "description": "National network providing AT information, device demonstrations, and lending programs in every state.",
        },
        {
            "url": "https://abledata.acl.gov/",
            "name": "AbleData",
            "description": "National database of assistive technology products with over 40,000 products for people with disabilities.",
        },
        {
            "url": "https://www.closingthegap.com/",
            "name": "Closing the Gap",
            "description": "Resource for assistive technology in education and employment for individuals with disabilities.",
        },
    ],
    "sports": [
        {
            "url": "https://www.specialolympics.org/",
            "name": "Special Olympics",
            "description": "World's largest sports organization for children and adults with intellectual disabilities — year-round training and competitions.",
        },
        {
            "url": "https://www.move-united.org/",
            "name": "Move United (formerly DSUSA)",
            "description": "Adaptive sports programs for youth and adults with physical disabilities including skiing, cycling, kayaking, and more.",
        },
        {
            "url": "https://www.miracleleague.com/",
            "name": "Miracle League",
            "description": "Adaptive baseball leagues for children with disabilities, with rubberized fields designed for wheelchairs and walkers.",
        },
    ],
    "emergency": [
        {
            "url": "https://www.ready.gov/disability",
            "name": "Ready.gov - People with Disabilities",
            "description": "Federal emergency preparedness resources specifically for individuals with disabilities and their caregivers.",
        },
        {
            "url": "https://www.fema.gov/emergency-managers/individuals-communities/disability",
            "name": "FEMA - Disability & Access",
            "description": "FEMA resources for emergency planning and disaster response for people with disabilities.",
        },
    ],
    "home-modifications": [
        {
            "url": "https://www.rebuildingtogether.org/",
            "name": "Rebuilding Together",
            "description": "Non-profit providing free home modifications and accessibility improvements for people with disabilities.",
        },
        {
            "url": "https://www.nahb.org/advocacy/industry-issues/accessibility/CAPS-program",
            "name": "CAPS - Certified Aging-in-Place Specialist",
            "description": "Find certified professionals trained in accessible home design and modifications for people with disabilities.",
        },
    ],
}


def scrape():
    """Compile national resources across all new categories."""
    scraped = []

    for category, sources in NATIONAL_SOURCES.items():
        for src in sources:
            resource = make_resource(
                name=src["name"],
                category=[category],
                location="National",
                description=src["description"],
                website=src["url"],
                source=src["url"],
                tags=[category],
            )
            scraped.append(resource)

    existing = load_existing('national.json')
    merged = merge_resources(existing, scraped)
    save_resources(merged, 'national.json')

    print(f"  Added/updated {len(scraped)} national resources across {len(NATIONAL_SOURCES)} categories")


if __name__ == '__main__':
    scrape()
