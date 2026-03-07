"""
Gig Processing Script
Handles two operations:
1. Auto-publish new gig submissions from Formspree webhook payload
2. Manage gig expiration: auto-expire old gigs and notify posters of upcoming expiration

Usage:
  python scrapers/sources/process_gig.py '{"title":"...","type":"...","posterEmail":"..."}'
  python scrapers/sources/process_gig.py --expire
  python scrapers/sources/process_gig.py --extend gig-20260307-a1b2
"""

import json
import sys
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

GIGS_FILE = Path(__file__).parent.parent.parent / "src" / "_data" / "gigs.json"
LOG_DIR = Path(__file__).parent.parent / "logs"
EXPIRY_DAYS = 14
EXPIRY_WARNING_DAYS = 2


def load_gigs():
    """Load existing gigs from JSON file."""
    if GIGS_FILE.exists():
        with open(GIGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_gigs(gigs):
    """Save gigs to JSON file."""
    GIGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(GIGS_FILE, "w", encoding="utf-8") as f:
        json.dump(gigs, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(gigs)} gigs to {GIGS_FILE}")


def generate_id():
    """Generate a unique gig ID."""
    now = datetime.now()
    date_part = now.strftime("%Y%m%d")
    hash_part = hashlib.md5(now.isoformat().encode()).hexdigest()[:4]
    return f"gig-{date_part}-{hash_part}"


def process_submission(payload_str):
    """Process a new gig submission from Formspree webhook."""
    try:
        data = json.loads(payload_str)
    except json.JSONDecodeError:
        print("Error: Invalid JSON payload")
        sys.exit(1)

    required_fields = ["title", "type", "category", "description", "location",
                       "compensation", "posterFirstName", "posterEmail"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        print(f"Error: Missing required fields: {', '.join(missing)}")
        sys.exit(1)

    today = datetime.now().strftime("%Y-%m-%d")
    expires = (datetime.now() + timedelta(days=EXPIRY_DAYS)).strftime("%Y-%m-%d")

    gig = {
        "id": generate_id(),
        "title": data["title"].strip()[:120],
        "type": data["type"],
        "category": data["category"],
        "description": data["description"].strip(),
        "location": data["location"],
        "remote": data.get("remote", "false") == "true",
        "compensation": data["compensation"],
        "rate": data.get("rate", ""),
        "timeline": data.get("timeline", ""),
        "postedDate": today,
        "expiresDate": expires,
        "status": "open",
        "posterFirstName": data["posterFirstName"].strip(),
        "posterEmail": data["posterEmail"].strip(),
        "skills": [s.strip() for s in data.get("skills", "").split(",") if s.strip()],
        "tags": [data["category"]]
    }

    gigs = load_gigs()
    gigs.append(gig)
    save_gigs(gigs)

    log_entry({"action": "published", "id": gig["id"], "title": gig["title"]})
    print(f"Published gig: {gig['id']} - {gig['title']}")
    return gig


def expire_gigs():
    """Auto-expire gigs past their expiration date and return expiring-soon gigs."""
    gigs = load_gigs()
    today = datetime.now().strftime("%Y-%m-%d")
    warning_date = (datetime.now() + timedelta(days=EXPIRY_WARNING_DAYS)).strftime("%Y-%m-%d")

    expired_count = 0
    expiring_soon = []

    for gig in gigs:
        if gig["status"] != "open":
            continue

        if gig.get("expiresDate", "") < today:
            gig["status"] = "expired"
            expired_count += 1
            log_entry({"action": "auto_expired", "id": gig["id"], "title": gig["title"]})
        elif gig.get("expiresDate", "") <= warning_date:
            expiring_soon.append(gig)

    if expired_count > 0:
        save_gigs(gigs)
        print(f"Auto-expired {expired_count} gigs")

    if expiring_soon:
        print(f"{len(expiring_soon)} gig(s) expiring within {EXPIRY_WARNING_DAYS} days:")
        for gig in expiring_soon:
            print(f"  - {gig['id']}: {gig['title']} (expires {gig['expiresDate']})")
            print(f"    Poster: {gig['posterFirstName']} <{gig['posterEmail']}>")

    return expiring_soon


def extend_gig(gig_id):
    """Extend a gig's expiration by another 14 days."""
    gigs = load_gigs()
    for gig in gigs:
        if gig["id"] == gig_id:
            new_expires = (datetime.now() + timedelta(days=EXPIRY_DAYS)).strftime("%Y-%m-%d")
            gig["expiresDate"] = new_expires
            if gig["status"] == "expired":
                gig["status"] = "open"
            save_gigs(gigs)
            log_entry({"action": "extended", "id": gig_id, "new_expires": new_expires})
            print(f"Extended gig {gig_id} until {new_expires}")
            return
    print(f"Gig {gig_id} not found")
    sys.exit(1)


def close_gig(gig_id):
    """Manually close a gig."""
    gigs = load_gigs()
    for gig in gigs:
        if gig["id"] == gig_id:
            gig["status"] = "closed"
            save_gigs(gigs)
            log_entry({"action": "closed", "id": gig_id})
            print(f"Closed gig {gig_id}")
            return
    print(f"Gig {gig_id} not found")
    sys.exit(1)


def generate_expiry_notifications(expiring_gigs):
    """Generate notification data for gigs about to expire.

    Returns a list of notification dicts that can be sent via email.
    The weekly scrape workflow handles the actual sending.
    """
    notifications = []
    for gig in expiring_gigs:
        notifications.append({
            "posterEmail": gig["posterEmail"],
            "posterName": gig["posterFirstName"],
            "gigId": gig["id"],
            "gigTitle": gig["title"],
            "expiresDate": gig["expiresDate"],
            "extendUrl": f"https://thefullestproject.org/gigs/",
            "message": (
                f"Hi {gig['posterFirstName']}, your gig \"{gig['title']}\" "
                f"expires on {gig['expiresDate']}. "
                f"Reply to this email with 'EXTEND' to keep it active for another 2 weeks, "
                f"or 'CLOSE' if you no longer need it."
            )
        })
    return notifications


def log_entry(entry):
    """Append to scrape log."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / "scrape_log.json"

    logs = []
    if log_file.exists():
        try:
            with open(log_file, "r", encoding="utf-8") as f:
                logs = json.load(f)
        except (json.JSONDecodeError, ValueError):
            logs = []

    log_record = {
        "scraper": "process_gig",
        "timestamp": datetime.now().isoformat(),
        "entry": entry
    }
    logs.append(log_record)
    logs = logs[-100:]

    with open(log_file, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2, ensure_ascii=False)


def weekly_digest():
    """Generate a weekly digest of gig activity."""
    gigs = load_gigs()
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

    new_gigs = [g for g in gigs if g.get("postedDate", "") >= week_ago]
    open_gigs = [g for g in gigs if g["status"] == "open"]
    expired_gigs = [g for g in gigs if g["status"] == "expired"]

    print("\n=== Weekly Gig Digest ===")
    print(f"New gigs this week: {len(new_gigs)}")
    print(f"Total open gigs: {len(open_gigs)}")
    print(f"Total expired gigs: {len(expired_gigs)}")
    print(f"Total gigs all time: {len(gigs)}")

    if new_gigs:
        print("\nNew gigs:")
        for g in new_gigs:
            print(f"  [{g['type']}] {g['title']} - {g['posterFirstName']} ({g['location']})")

    return {
        "new_count": len(new_gigs),
        "open_count": len(open_gigs),
        "expired_count": len(expired_gigs),
        "total_count": len(gigs)
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python process_gig.py '{json_payload}'  — publish a new gig")
        print("  python process_gig.py --expire           — expire old gigs + notify")
        print("  python process_gig.py --extend <gig-id>  — extend a gig by 14 days")
        print("  python process_gig.py --close <gig-id>   — close a gig")
        print("  python process_gig.py --digest            — weekly digest")
        sys.exit(1)

    if sys.argv[1] == "--expire":
        expiring = expire_gigs()
        if expiring:
            notifications = generate_expiry_notifications(expiring)
            # Save notifications for the workflow to process
            notif_file = LOG_DIR / "expiry_notifications.json"
            LOG_DIR.mkdir(parents=True, exist_ok=True)
            with open(notif_file, "w", encoding="utf-8") as f:
                json.dump(notifications, f, indent=2, ensure_ascii=False)
            print(f"Saved {len(notifications)} expiry notifications to {notif_file}")
    elif sys.argv[1] == "--extend":
        if len(sys.argv) < 3:
            print("Error: --extend requires a gig ID")
            sys.exit(1)
        extend_gig(sys.argv[2])
    elif sys.argv[1] == "--close":
        if len(sys.argv) < 3:
            print("Error: --close requires a gig ID")
            sys.exit(1)
        close_gig(sys.argv[2])
    elif sys.argv[1] == "--digest":
        weekly_digest()
    else:
        process_submission(sys.argv[1])
