"""Fix remaining broken URLs with correct resource names."""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "_data" / "resources"

FIXES = [
    # (filename, exact_name, new_website, new_source_if_different)
    ("nova.json", "Camp Baker (The Arc of NoVA)",
     "https://soar365.org/find-support/summer-camp/get-started/", None),
    ("nova.json", "Virginia Disability Parking Pass",
     "https://www.dmv.virginia.gov/licenses-ids/disability/apply-assist", None),
    ("nova.json", "Virginia Assistive Technology System (VATS)",
     "https://www.vats.virginia.gov/", None),
    ("nova.json", "Virginia Early Intervention (Infant & Toddler Connection)",
     "https://itcva.online/", None),
    ("national.json", "Move United (formerly DSUSA)",
     "https://moveunitedsport.org/", None),
    ("national.json", "CAPS - Certified Aging-in-Place Specialist",
     "https://www.nahb.org/education-and-events/credentials/certified-aging-in-place-specialist-caps", None),
]

REMOVALS = [
    ("national.json", "National Aging and Disability Transportation Center"),
]

for filename, name, new_url, new_source in FIXES:
    filepath = DATA_DIR / filename
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    for r in data:
        if r.get("name") == name:
            old = r.get("website", "")
            r["website"] = new_url
            if r.get("source") == old:
                r["source"] = new_url
            print(f"FIXED: {name} -> {new_url}")
            break
    else:
        print(f"NOT FOUND: {name}")
        continue

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

for filename, name in REMOVALS:
    filepath = DATA_DIR / filename
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    before = len(data)
    data = [r for r in data if r.get("name") != name]
    if len(data) < before:
        print(f"REMOVED: {name}")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    else:
        print(f"NOT FOUND FOR REMOVAL: {name}")

# Also fix the same resources in states/VA.json if they exist
va_file = DATA_DIR / "states" / "VA.json"
if va_file.exists():
    with open(va_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    va_fixes = {
        "Camp Baker (The Arc of NoVA)": "https://soar365.org/find-support/summer-camp/get-started/",
        "Virginia Disability Parking Pass": "https://www.dmv.virginia.gov/licenses-ids/disability/apply-assist",
        "Virginia Assistive Technology System (VATS)": "https://www.vats.virginia.gov/",
        "Virginia Early Intervention (Infant & Toddler Connection)": "https://itcva.online/",
    }

    for r in data:
        name = r.get("name", "")
        if name in va_fixes:
            old = r.get("website", "")
            r["website"] = va_fixes[name]
            if r.get("source") == old:
                r["source"] = va_fixes[name]
            print(f"FIXED (VA.json): {name}")

    with open(va_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDone!")
