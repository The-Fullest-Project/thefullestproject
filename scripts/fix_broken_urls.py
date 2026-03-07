"""Fix broken URLs identified by the 404 checker agent."""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "_data" / "resources"

# URL fixes: (file, resource_name, field, old_value, new_value)
URL_FIXES = [
    # --- nova.json fixes ---
    ("nova.json", "ServiceSource", "website",
     "https://www.servicesfource.org/",
     "https://servicesource.org/"),

    ("nova.json", "BlazeSports America", "website",
     "https://bfreinc.org/",
     "https://blazesports.org/"),

    ("nova.json", "Camp Baker", "website",
     "https://www.campbaker.org/",
     "https://soar365.org/find-support/summer-camp/get-started/"),

    ("nova.json", "Virginia DMV Disability Parking", "website",
     "https://www.dmv.virginia.gov/drivers/#disability/apply_assist.asp",
     "https://www.dmv.virginia.gov/licenses-ids/disability/apply-assist"),

    ("nova.json", "VATS - Virginia Assistive Technology System", "website",
     "https://vats.org/",
     "https://www.vats.virginia.gov/"),

    ("nova.json", "The Arc of NoVA - Pooled Trust", "website",
     "https://www.thearcofnova.org/programs/trusts/",
     "https://thearcofnova.org/program/trust/"),

    ("nova.json", "B&O Railroad Museum - Sensory Sundays", "website",
     "https://www.borail.org/explore-learn/for-kids-families/sensory-awareness/",
     "https://www.borail.org/events/sensory-sundays/"),

    ("nova.json", "Virginia Early Intervention / Infant & Toddler Connection", "website",
     "https://www.infantva.org/",
     "https://itcva.online/"),

    # --- national.json fixes ---
    ("national.json", "Move United", "website",
     "https://www.move-united.org/",
     "https://moveunitedsport.org/"),

    ("national.json", "CDC - Learn the Signs. Act Early.", "website",
     "https://www.cdc.gov/ncbddd/actearly/",
     "https://www.cdc.gov/act-early/index.html"),

    ("national.json", "NAHB CAPS Program", "website",
     "https://www.nahb.org/advocacy/industry-issues/accessibility/CAPS-program",
     "https://www.nahb.org/education-and-events/credentials/certified-aging-in-place-specialist-caps"),

    ("national.json", "FEMA - Disability & Access", "website",
     "https://www.fema.gov/emergency-managers/individuals-communities/disability",
     "https://www.fema.gov/about/offices/disability"),
]

# Resources to remove (organization shut down)
REMOVALS = [
    ("national.json", "NADTC - National Aging and Disability Transportation Center"),
]


def fix_urls():
    files_modified = set()

    for filename, name, field, old_val, new_val in URL_FIXES:
        filepath = DATA_DIR / filename
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        found = False
        for resource in data:
            if resource.get("name") == name:
                current = resource.get(field, "")
                if current == old_val:
                    resource[field] = new_val
                    # Also update source if it matches
                    if resource.get("source") == old_val:
                        resource["source"] = new_val
                    print(f"FIXED: {name} -> {new_val}")
                    found = True
                elif current == new_val:
                    print(f"ALREADY FIXED: {name}")
                    found = True
                else:
                    print(f"WARNING: {name} has unexpected URL: {current}")
                    # Fix it anyway
                    resource[field] = new_val
                    if resource.get("source") == current:
                        resource["source"] = new_val
                    found = True
                break

        if not found:
            print(f"NOT FOUND: {name} in {filename}")
            continue

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        files_modified.add(filename)

    # Handle removals
    for filename, name in REMOVALS:
        filepath = DATA_DIR / filename
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        original_len = len(data)
        data = [r for r in data if r.get("name") != name]
        if len(data) < original_len:
            print(f"REMOVED: {name} (organization shut down)")
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            files_modified.add(filename)
        else:
            print(f"NOT FOUND FOR REMOVAL: {name}")

    print(f"\nModified files: {', '.join(files_modified)}")


if __name__ == "__main__":
    fix_urls()
