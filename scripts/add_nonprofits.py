"""Add local nonprofit/foundation resources to nova.json."""
import json
from pathlib import Path

NOVA_FILE = Path(__file__).parent.parent / "src" / "_data" / "resources" / "nova.json"

new_resources = [
    {
        "name": "Sweet Julia Grace Foundation",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "manassas",
        "description": "Blesses, celebrates, and loves children who are seriously ill or have special needs. Provides adaptive equipment, home modifications, dream trips, and family support.",
        "phone": "",
        "website": "https://www.sweetjuliagrace.org/",
        "address": "9000 Mike Garcia Drive #140, Manassas, VA 20109",
        "ageRange": "Children",
        "disabilityTypes": [],
        "cost": "Free",
        "tags": ["family-support", "adaptive-equipment", "grants", "wish-fulfillment", "home-modifications"],
        "source": "https://www.sweetjuliagrace.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Autism Society of Northern Virginia",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "oakton",
        "description": "Builds community for over 5,000 individuals and families affected by autism through education, advocacy, and support. Offers mini-grants up to $1,000/year for autism-related services.",
        "phone": "571-328-5792",
        "website": "https://www.asnv.org/",
        "address": "10467 White Granite Drive, Suite 324, Oakton, VA 22124",
        "ageRange": "All ages",
        "disabilityTypes": ["autism"],
        "cost": "",
        "tags": ["autism", "advocacy", "support-groups", "mini-grants", "education"],
        "source": "https://www.asnv.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Down Syndrome Association of Northern Virginia",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "oakton",
        "description": "Support, education, and community for families of individuals with Down syndrome across Arlington, Fairfax, Loudoun, Prince William, and Stafford counties.",
        "phone": "703-621-7129",
        "website": "https://www.dsanv.org/",
        "address": "",
        "ageRange": "All ages",
        "disabilityTypes": ["down-syndrome"],
        "cost": "",
        "tags": ["down-syndrome", "parent-support", "community", "education", "events"],
        "source": "https://www.dsanv.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Parents of Autistic Children of Northern Virginia (POAC-NoVA)",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "burke",
        "description": "Volunteer-run nonprofit where families help families navigate autism. Operates a listserv, membership meetings, parent support groups, and educational programs.",
        "phone": "703-391-2251",
        "website": "https://poac-nova.org/",
        "address": "",
        "ageRange": "Children",
        "disabilityTypes": ["autism"],
        "cost": "Free",
        "tags": ["autism", "parent-support", "support-groups", "education", "volunteer-run"],
        "source": "https://poac-nova.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Formed Families Forward",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Supports foster, kinship, and adoptive families of children and youth with disabilities and special needs. Provides training, peer support, and resource navigation.",
        "phone": "703-539-2904",
        "website": "https://formedfamiliesforward.org/",
        "address": "10304 Eaton Place, Suite 100, Fairfax, VA 22030",
        "ageRange": "Children and youth",
        "disabilityTypes": [],
        "cost": "Free",
        "tags": ["foster-families", "adoptive-families", "kinship-care", "training", "resource-navigation"],
        "source": "https://formedfamiliesforward.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Equipment Connections for Children (ECFC)",
        "category": ["nonprofit", "equipment"],
        "location": "Northern Virginia",
        "area": "",
        "description": "Connects families of children with disabilities to donated adaptive equipment at no cost including standing frames, walkers, bath equipment, adaptive bicycles, and therapy equipment. Serves over 600 families annually.",
        "phone": "",
        "website": "https://www.equipforchildren.org/",
        "address": "",
        "ageRange": "Children",
        "disabilityTypes": [],
        "cost": "Free",
        "tags": ["adaptive-equipment", "assistive-technology", "free-equipment", "walkers", "wheelchairs"],
        "source": "https://www.equipforchildren.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Jill's House",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "vienna",
        "description": "Short-term overnight respite care for children ages 6-17 with intellectual disabilities in a 45-bed facility. Weekend and weeknight programs so families can recharge.",
        "phone": "",
        "website": "https://jillshouse.org/",
        "address": "9011 Leesburg Pike, Vienna, VA 22182",
        "ageRange": "6-17",
        "disabilityTypes": ["intellectual-disabilities"],
        "cost": "Subsidized",
        "tags": ["respite-care", "overnight-care", "family-support", "recreation"],
        "source": "https://jillshouse.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Epilepsy Foundation of Virginia",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "",
        "description": "Statewide organization serving Virginians with epilepsy since 1978. Provides educational trainings, support networks, and self-management programs at no cost.",
        "phone": "434-924-8669",
        "website": "https://www.epilepsyva.com/",
        "address": "",
        "ageRange": "All ages",
        "disabilityTypes": ["epilepsy"],
        "cost": "Free",
        "tags": ["epilepsy", "seizure-disorders", "education", "support-networks"],
        "source": "https://www.epilepsyva.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Special Olympics Virginia - Area 26 (Northern Virginia)",
        "category": ["nonprofit", "recreation"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Year-round sports training and athletic competition for children and adults with intellectual disabilities across Fairfax County, Arlington, and Alexandria. Supports over 3,500 athletes.",
        "phone": "703-359-4301",
        "website": "https://www.novasova.org/",
        "address": "11350 Random Hills Road C-140, Fairfax, VA 22030",
        "ageRange": "All ages",
        "disabilityTypes": ["intellectual-disabilities"],
        "cost": "Free",
        "tags": ["sports", "athletics", "inclusion", "recreation", "social"],
        "source": "https://www.novasova.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "NAMI Northern Virginia",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "arlington",
        "description": "Free mental health support, education, and resources for individuals with mental illness and their families. Offers Family-to-Family classes and parent support groups for caregivers of children under 18.",
        "phone": "571-458-7310",
        "website": "https://nami-northernvirginia.org/",
        "address": "",
        "ageRange": "All ages",
        "disabilityTypes": ["mental-health"],
        "cost": "Free",
        "tags": ["mental-health", "support-groups", "family-education", "advocacy", "caregiver-support"],
        "source": "https://nami-northernvirginia.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Best Buddies in Virginia & DC",
        "category": ["nonprofit"],
        "location": "Northern Virginia",
        "area": "tysons",
        "description": "One-to-one friendships, integrated employment, and leadership development for people with intellectual and developmental disabilities. Operates 93 friendship chapters across Virginia and DC.",
        "phone": "833-646-6828",
        "website": "https://www.bestbuddies.org/vadc/",
        "address": "7956L Tysons Corner Center, Tysons, VA 22102",
        "ageRange": "All ages",
        "disabilityTypes": ["intellectual-disabilities", "developmental-disabilities"],
        "cost": "Free",
        "tags": ["friendship", "social-inclusion", "employment", "leadership", "peer-mentoring"],
        "source": "https://www.bestbuddies.org/vadc/",
        "lastScraped": "2026-03-07"
    }
]

with open(NOVA_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

existing_names = {r["name"].lower() for r in data}
added = 0
for r in new_resources:
    if r["name"].lower() not in existing_names:
        data.append(r)
        added += 1
    else:
        print(f"Skipped duplicate: {r['name']}")

with open(NOVA_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {added} nonprofit resources. Total: {len(data)}")
