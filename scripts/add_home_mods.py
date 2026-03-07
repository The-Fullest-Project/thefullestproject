"""Add home modification providers to nova.json."""
import json
from pathlib import Path

NOVA_FILE = Path(__file__).parent.parent / "src" / "_data" / "resources" / "nova.json"

new_resources = [
    {
        "name": "Glickman Design Build",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "north potomac",
        "description": "Design-build firm with a dedicated Accessible Design Division specializing in modifications for families of children with special needs and aging adults. CAPS and Universal Design Certified staff.",
        "phone": "(703) 832-8150",
        "website": "https://www.glickmandesignbuild.com",
        "address": "",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["accessibility", "universal-design", "aging-in-place", "wheelchair-accessibility", "bathroom-modifications"],
        "source": "https://www.glickmandesignbuild.com/services/mobility-solutions/accessible-design/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Veteran Built Homes",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "woodbridge",
        "description": "Veteran-owned remodeling company offering kitchen, bathroom, and basement remodeling with accessible layout options. Provides guidance on Virginia Livable Home Tax Credit.",
        "phone": "(571) 570-9027",
        "website": "https://www.vetbuilthomes.com",
        "address": "12302 Beechnut Ct, Woodbridge, VA 22192",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["accessibility", "bathroom-modifications", "veteran-owned", "remodeling"],
        "source": "https://www.vetbuilthomes.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Next Day Access (Northern Virginia)",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "sterling",
        "description": "Mobility solutions including wheelchair ramps, stair lifts, grab bars, vertical platform lifts, and vehicle lifts. Free in-home consultations with rental and purchase options.",
        "phone": "(703) 854-0001",
        "website": "https://www.nextdayaccess.com/fairfax-va/",
        "address": "45681 Oakbrook Court, Unit 110, Sterling, VA 20166",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["accessibility", "wheelchair-ramps", "stair-lifts", "grab-bars", "equipment-rental"],
        "source": "https://www.nextdayaccess.com/fairfax-va/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Live In Place",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "sterling",
        "description": "Employs Occupational Therapists who are Certified Aging-in-Place Specialists to assess homes and install stair lifts, ramps, grab bars, and entrance modifications. Over 5,000 families served since 2007.",
        "phone": "(703) 433-0380",
        "website": "https://www.liveinplace.com",
        "address": "",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["accessibility", "aging-in-place", "grab-bars", "stair-lifts", "wheelchair-ramps", "home-assessment"],
        "source": "https://www.liveinplace.com/home-solutions",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Schroeder Design Build",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Family-owned design-build firm with two registered architects specializing in accessible design and aging-in-place renovations including wider doorways, step-free entryways, and accessible bathrooms.",
        "phone": "",
        "website": "https://schroederdesignbuild.com",
        "address": "",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["accessibility", "universal-design", "aging-in-place", "bathroom-modifications", "design-build"],
        "source": "https://schroederdesignbuild.com/accessible-design-aging-in-place-northern-va/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "HandyPro of Northern Virginia",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "",
        "description": "Home modification company using universal design principles to install grab bars, walk-in tubs, stair lifts, wheelchair ramps, walk-in showers, and widen doorways. Free in-home safety assessments.",
        "phone": "(703) 408-0197",
        "website": "https://www.handypro.com/local-service-category/northern-virginia-home-modification",
        "address": "",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["accessibility", "universal-design", "grab-bars", "wheelchair-ramps", "bathroom-modifications", "stair-lifts"],
        "source": "https://www.handypro.com/local-service-category/northern-virginia-home-modification",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Carbide Construction",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Specializes in ADA-compliant modular home additions with accessible bathrooms, user-friendly kitchens, wider hallways, and wheelchair-friendly layouts.",
        "phone": "(703) 550-8711",
        "website": "https://www.carbideconstruction.com",
        "address": "",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["accessibility", "ADA-compliant", "wheelchair-accessibility", "home-additions", "modular-construction"],
        "source": "https://www.carbideconstruction.com/ada-addition-northern-virginia/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Rebuilding Together Arlington/Fairfax/Falls Church",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "arlington",
        "description": "Nonprofit providing free home repairs and accessibility modifications for low-income homeowners. Installs grab bars, stair rails, wheelchair ramps, stairlifts, and comfort-height toilets at no cost.",
        "phone": "(703) 528-1999",
        "website": "https://rebuildingtogether-aff.org",
        "address": "",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "Free (income-qualified)",
        "tags": ["accessibility", "free-modifications", "nonprofit", "grab-bars", "wheelchair-ramps", "low-income"],
        "source": "https://rebuildingtogether-aff.org",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "ENDependence Center of Northern Virginia (ECNV)",
        "category": ["home-modifications"],
        "location": "Northern Virginia",
        "area": "arlington",
        "description": "Independent living center administering Virginia Housing Accessibility Grants of up to $8,000 for ramps, chairlifts, bathroom/kitchen modifications, and door widening. Available to homeowners, renters, and veterans.",
        "phone": "(703) 525-3268",
        "website": "https://www.ecnv.org",
        "address": "2300 Clarendon Blvd, Ste 250, Arlington, VA 22201",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "Free grants up to $8,000 (income-qualified)",
        "tags": ["accessibility", "grants", "nonprofit", "wheelchair-ramps", "bathroom-modifications", "independent-living"],
        "source": "https://www.ecnv.org",
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

print(f"Added {added} home modification resources. Total: {len(data)}")
