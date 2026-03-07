"""Add legal/advocacy resources to nova.json."""
import json
from pathlib import Path

NOVA_FILE = Path(__file__).parent.parent / "src" / "_data" / "resources" / "nova.json"

new_resources = [
    {
        "name": "Cucinelli Geiger, PC",
        "category": ["legal", "financial"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Elder law and special needs planning firm offering special needs trusts, ABLE accounts, guardianship/conservatorship, estate planning, and fiduciary services.",
        "phone": "(703) 481-6464",
        "website": "https://www.cucinelligeiger.com/practice_areas/virginia-special-needs-planning-attorneys.cfm",
        "address": "4084 University Drive, Suite 202A, Fairfax, VA 22030",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["special-needs-trust", "estate-planning", "guardianship", "ABLE-accounts"],
        "source": "https://www.cucinelligeiger.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Hale Ball Murphy, PLC",
        "category": ["legal", "financial"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "AV-rated firm serving Northern Virginia since 1980, offering special needs trusts, guardianship, conservatorship, powers of attorney, and estate planning.",
        "phone": "(703) 591-4900",
        "website": "https://haleball.com/practice-area/special-needs-planning/",
        "address": "10511 Judicial Drive, Fairfax, VA 22030",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["special-needs-trust", "estate-planning", "guardianship", "conservatorship"],
        "source": "https://haleball.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Farr Law Firm, P.C.",
        "category": ["legal", "financial"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Premier estate planning and elder law firm providing special needs trust planning, guardianship, Medicaid asset protection, and comprehensive special needs planning.",
        "phone": "(703) 691-1888",
        "website": "https://www.farrlawfirm.com/special-needs-planning/",
        "address": "10640 Main Street, Suite 200, Fairfax, VA 22030",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["special-needs-trust", "estate-planning", "guardianship", "medicaid-planning"],
        "source": "https://www.farrlawfirm.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "The Sack Law Firm, P.C.",
        "category": ["legal", "financial"],
        "location": "Northern Virginia",
        "area": "mclean",
        "description": "Special needs law services including special needs trusts, guardianships, conservatorships, and special education advocacy for families in Northern Virginia.",
        "phone": "(703) 883-0102",
        "website": "https://www.sacklaw.com/practice-areas/special-education-and-related-services/",
        "address": "8270 Greensboro Drive, Suite 810, McLean, VA 22102",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["special-needs-trust", "guardianship", "special-education", "iep-advocacy"],
        "source": "https://www.sacklaw.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "McCandlish Lillard, P.C.",
        "category": ["legal", "financial"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Full-service firm with elder law and special needs practice led by Certified Elder Law Attorney, offering special needs trusts, guardianships, conservatorships, and estate planning.",
        "phone": "(703) 273-2288",
        "website": "https://mccandlaw.com/practice/elder-law-special-needs/",
        "address": "11350 Random Hills Road, Suite 500, Fairfax, VA 22030",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["special-needs-trust", "estate-planning", "guardianship", "elder-law"],
        "source": "https://mccandlaw.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "The Law Office of Aubrey Carew Sizer, PLLC",
        "category": ["legal", "financial"],
        "location": "Northern Virginia",
        "area": "springfield",
        "description": "Customized and affordable estate planning, special needs planning, guardianships, conservatorships, and long-term care planning throughout Northern Virginia.",
        "phone": "(571) 403-2619",
        "website": "https://www.carewsizerlaw.com/special-needs-planning-for-the-disabled",
        "address": "6564 Loisdale Court, Suite 600, Springfield, VA 22150",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["special-needs-trust", "estate-planning", "guardianship", "conservatorship"],
        "source": "https://www.carewsizerlaw.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Law Office of Grace E. Kim, PC",
        "category": ["legal"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Specializes exclusively in special education and education law, handling IEP disputes, due process claims, Section 504, ADA matters, and school discipline from pre-K through graduation.",
        "phone": "(703) 225-3395",
        "website": "https://www.gekimlaw.com/",
        "address": "11325 Random Hills Road, Suite 360-110, Fairfax, VA 22030",
        "ageRange": "Pre-K to 22",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["iep-advocacy", "special-education", "disability-law", "504-plan", "due-process"],
        "source": "https://www.gekimlaw.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Belkowitz Law, PLLC",
        "category": ["legal"],
        "location": "Northern Virginia",
        "area": "fairfax",
        "description": "Represents families in special education matters under IDEA, ADA, and Section 504 including IEP disputes, due process hearings, and school disciplinary cases. Free 30-minute initial consultation.",
        "phone": "(703) 246-9270",
        "website": "https://belkowitzlaw.com/",
        "address": "10427 North Street, Suite 200, Fairfax, VA 22030",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "Free 30-minute initial consultation",
        "tags": ["iep-advocacy", "special-education", "disability-law", "504-plan", "due-process"],
        "source": "https://belkowitzlaw.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Pizer Law, PLLC",
        "category": ["legal"],
        "location": "Northern Virginia",
        "area": "arlington",
        "description": "Special education attorney representing families of students with autism, ADHD, emotional disabilities, and learning disabilities. Handles IEPs, due process, and school meetings.",
        "phone": "(703) 241-1391",
        "website": "https://pizer.law/",
        "address": "2503-D North Harrison Street, #1137, Arlington, VA 22207",
        "ageRange": "",
        "disabilityTypes": ["autism", "adhd", "learning-disabilities"],
        "cost": "",
        "tags": ["iep-advocacy", "special-education", "disability-law", "504-plan", "autism"],
        "source": "https://pizer.law/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Tuomey Law Firm",
        "category": ["legal"],
        "location": "Northern Virginia",
        "area": "leesburg",
        "description": "Special education advocacy including IEP and 504 plan support across Loudoun, Prince William, Fairfax, and Arlington counties.",
        "phone": "(571) 565-5440",
        "website": "https://tuomeylawfirm.com/special-education-advocacy/",
        "address": "208 Church Street SE, Leesburg, VA 20176",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["iep-advocacy", "special-education", "504-plan"],
        "source": "https://tuomeylawfirm.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "The Law Office of Joan H. Proper, PC",
        "category": ["legal"],
        "location": "Northern Virginia",
        "area": "manassas",
        "description": "Devoted to student legal issues with a focus on special education law, representing parents in IEP and 504 matters for students with autism, learning disabilities, and emotional disabilities.",
        "phone": "(703) 291-6660",
        "website": "https://www.jproperlaw.com/education-law/",
        "address": "9300 West Courthouse Road, Suite 202, Manassas, VA 20110",
        "ageRange": "",
        "disabilityTypes": ["autism", "learning-disabilities"],
        "cost": "",
        "tags": ["iep-advocacy", "special-education", "disability-law", "504-plan"],
        "source": "https://www.jproperlaw.com/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "disAbility Law Center of Virginia (dLCV)",
        "category": ["legal"],
        "location": "Northern Virginia",
        "area": "",
        "description": "Virginia's designated Protection and Advocacy organization providing free legal services and direct representation for Virginians with disabilities facing abuse, neglect, discrimination, and special education issues.",
        "phone": "(800) 552-3962",
        "website": "https://www.dlcv.org/",
        "address": "",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "Free",
        "tags": ["disability-rights", "advocacy", "nonprofit", "special-education", "protection-and-advocacy"],
        "source": "https://www.dlcv.org/",
        "lastScraped": "2026-03-07"
    },
    {
        "name": "Education Advocates of Northern Virginia, LLC",
        "category": ["legal"],
        "location": "Northern Virginia",
        "area": "herndon",
        "description": "Educational advocate with legal background specializing in helping families navigate the special education system and secure appropriate IEP services.",
        "phone": "(703) 620-0206",
        "website": "https://www.educationadvocatesnova.com/",
        "address": "3224 Navy Drive, Herndon, VA 20171",
        "ageRange": "",
        "disabilityTypes": [],
        "cost": "",
        "tags": ["iep-advocacy", "special-education", "504-plan", "education-advocacy"],
        "source": "https://www.educationadvocatesnova.com/",
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

print(f"Added {added} legal resources. Total: {len(data)}")
