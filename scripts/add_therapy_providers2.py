"""Add additional therapy providers from second research agent."""
import json
from pathlib import Path

NOVA_FILE = Path(__file__).parent.parent / "src" / "_data" / "resources" / "nova.json"

new_providers = [
    {
        "name": "Exceptional Children's Center",
        "category": ["therapy"],
        "location": "Northern Virginia",
        "area": "springfield",
        "description": "Pediatric therapy center offering occupational therapy, speech-language therapy, and feeding therapy, specializing in developmental and behavioral challenges.",
        "phone": "703-971-0602",
        "website": "https://www.exceptionalchildrenscenter.com/",
        "address": "7001 A Loisdale Rd, Springfield, VA 22150",
        "ageRange": "Pediatric",
        "disabilityTypes": [],
        "cost": "Insurance accepted",
        "tags": ["occupational-therapy", "speech-therapy", "feeding-therapy"],
        "source": "https://www.exceptionalchildrenscenter.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Expressive Speech and Feeding",
        "category": ["therapy"],
        "location": "Northern Virginia",
        "area": "herndon",
        "description": "Private practice specializing in pediatric speech therapy and feeding therapy for children from birth to 8 years in the Reston and Herndon area.",
        "phone": "703-672-0634",
        "website": "https://expressivespeechandfeeding.com/",
        "address": "2622 Quincy Adams Dr, Herndon, VA 20171",
        "ageRange": "Birth-8",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["speech-therapy", "feeding-therapy"],
        "source": "https://expressivespeechandfeeding.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "ABA Centers of Virginia",
        "category": ["therapy"],
        "location": "Northern Virginia",
        "area": "arlington",
        "description": "In-home and community-based ABA therapy for children with autism, serving Arlington and greater Northern Virginia.",
        "phone": "855-957-1892",
        "website": "https://www.abacentersva.com/",
        "address": "",
        "ageRange": "Pediatric",
        "disabilityTypes": ["autism"],
        "cost": "Insurance accepted",
        "tags": ["aba-therapy", "autism", "in-home"],
        "source": "https://www.abacentersva.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Flywheel Centers",
        "category": ["therapy"],
        "location": "Northern Virginia",
        "area": "alexandria",
        "description": "ABA therapy center offering in-home visits and center-based sessions for children with autism. Accepts TRICARE.",
        "phone": "866-642-9433",
        "website": "https://flywheelcenters.com/",
        "address": "44 Canal Center Plaza, Alexandria, VA 22314",
        "ageRange": "Pediatric",
        "disabilityTypes": ["autism"],
        "cost": "Insurance accepted, TRICARE accepted",
        "tags": ["aba-therapy", "autism", "in-home", "tricare"],
        "source": "https://flywheelcenters.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Compass Behavioral Solutions - NOVA",
        "category": ["therapy"],
        "location": "Northern Virginia",
        "area": "manassas",
        "description": "Home, office, and clinic-based ABA and mental health services for children and adolescents under 21 with developmental delays.",
        "phone": "703-496-7804",
        "website": "https://compassva.com/location/nova/",
        "address": "7611 Coppermine Drive, Manassas, VA 20109",
        "ageRange": "Birth-21",
        "disabilityTypes": ["autism", "developmental-delays"],
        "cost": "Insurance accepted",
        "tags": ["aba-therapy", "autism", "mental-health", "in-home"],
        "source": "https://compassva.com/location/nova/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Attain ABA Therapy",
        "category": ["therapy"],
        "location": "Northern Virginia",
        "area": "herndon",
        "description": "In-home, school-based, and remote ABA therapy for children with autism, plus parent training and BCBA supervision.",
        "phone": "",
        "website": "https://www.attainaba.com/behavior-analysis/aba-therapy-in-virginia/",
        "address": "465 Herndon Parkway, Herndon, VA 20170",
        "ageRange": "Pediatric",
        "disabilityTypes": ["autism"],
        "cost": "Medicaid and most major insurance accepted",
        "tags": ["aba-therapy", "autism", "in-home", "school-based", "telehealth", "parent-training"],
        "source": "https://www.attainaba.com/behavior-analysis/aba-therapy-in-virginia/",
        "lastScraped": "2026-03-07"
    }
]

with open(NOVA_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

existing_names = {r["name"].lower() for r in data}
added = 0
for p in new_providers:
    if p["name"].lower() not in existing_names:
        data.append(p)
        added += 1
    else:
        print(f"Skipped duplicate: {p['name']}")

with open(NOVA_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {added} additional therapy providers. Total resources: {len(data)}")
