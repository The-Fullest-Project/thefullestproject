"""Shared mapping + relevance helpers for the discovery scrapers.

Lives in scrapers/ (not scrapers/sources/) so run_all.py never auto-runs it.
Maps raw source categories (OSM tags, CMS provider types, news keywords) onto
the site's canonical category slugs and decides whether a candidate is actually
disability-relevant before it reaches the review queue.
"""

# Canonical slugs — MUST stay in sync with src/_data/categories.json
SITE_CATEGORIES = {
    "therapy", "equipment", "education", "recreation", "respite", "employment",
    "nonprofit", "faith", "sensory", "childcare", "legal", "clothing",
    "community", "government", "early-intervention", "transition", "financial",
    "insurance", "planning", "mental-health", "transportation", "housing",
    "medical", "camps", "sibling-support", "assistive-tech", "sports",
    "emergency", "home-modifications", "apps", "other",
}

# US states + DC: code <-> full name. State resource files use the full name
# as `location` (e.g. "Oregon"), keyed by file states/XX.json.
STATE_NAME = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "DC": "District of Columbia", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana",
    "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana",
    "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan",
    "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina",
    "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon",
    "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
}
STATE_CODE = {name: code for code, name in STATE_NAME.items()}
ALL_STATE_CODES = list(STATE_NAME.keys())

# Words that mark a candidate as genuinely disability/caregiver relevant.
RELEVANCE_KEYWORDS = (
    "disability", "disabled", "disabilities", "special needs", "special-needs",
    "autism", "autistic", "asd", "developmental", "intellectual disabilit",
    "idd", "cerebral palsy", "down syndrome", "wheelchair", "accessible",
    "accessibility", "adaptive", "assistive", "rehabilitation", "rehab",
    "therapy", "therapist", "occupational therap", "physical therap",
    "speech therap", "speech-language", "sensory", "deaf", "hard of hearing",
    "blind", "low vision", "visually impair", "hearing impair", "prosthetic",
    "orthotic", "respite", "caregiver", "special education", "early intervention",
    "neurodivergent", "spina bifida",
    "muscular dystrophy", "traumatic brain", "tbi", "paraly", "mobility",
)

# Words that, when present and with NO relevance keyword, mark a row as noise
# (e.g. senior-only or generic services that aren't disability resources).
NOISE_KEYWORDS = (
    "senior center", "retirement", "elderly", "55+", "active adult",
    "funeral", "cemetery", "real estate", "auto repair", "car wash",
)

# Services intentionally OUT of scope for the directory. Candidates that look
# like mental-health counseling, psychiatry, chiropractic, or behavioral-health
# services are dropped before they ever reach the review queue (admin decision
# 2026-07). Note: "mental-health" stays a valid site category for curated/manual
# entries — this only stops the scrapers from queuing NEW ones.
EXCLUDE_KEYWORDS = (
    "chiropract", "psychotherap", "psychiatr", "counseling", "counselling",
    "counselor", "counsellor", "behavioral health", "behavioural health",
    "mental health", "mental-health",
)
EXCLUDE_HEALTHCARE = {"psychotherapist", "counselling", "psychiatry", "psychiatrist"}
EXCLUDE_SOCIAL_FOR = {"mental_health"}


def is_excluded(text, tags=None):
    """True if a candidate is an out-of-scope mental-health / chiropractic /
    behavioral-health service that should NOT be scraped into the queue."""
    blob = (text or "").lower()
    tags = tags or {}
    if tags.get("healthcare", "") in EXCLUDE_HEALTHCARE:
        return True
    sf_for = tags.get("social_facility:for", "").lower()
    if any(v in sf_for for v in EXCLUDE_SOCIAL_FOR):
        return True
    if "genetic counsel" in blob:  # genetic counseling is a wanted medical service
        return False
    return any(kw in blob for kw in EXCLUDE_KEYWORDS)

# OSM tag -> site category slug. Checked in order; first match wins.
_OSM_RULES = [
    ("office", "therapist", "therapy"),
    ("healthcare", "rehabilitation", "therapy"),
    ("healthcare", "physiotherapist", "therapy"),
    ("healthcare", "occupational_therapist", "therapy"),
    ("healthcare", "speech_therapist", "therapy"),
    ("healthcare", "therapist", "therapy"),
    ("shop", "mobility", "equipment"),
    ("shop", "medical_supply", "equipment"),
    ("healthcare", "hospital", "medical"),
    ("healthcare", "clinic", "medical"),
    ("healthcare", "centre", "medical"),
    ("amenity", "clinic", "medical"),
    ("amenity", "social_centre", "community"),
    ("office", "charity", "nonprofit"),
]

# social_facility:for value -> slug (disability-relevant subset)
_SOCIAL_FOR = {
    "disabled": "community",
    "mental_health": None,   # mental-health is out of scope for scraping
    "autism": "community",
    "senior": None,   # not disability-relevant on its own
    "child": None,
}

# social_facility value -> slug
_SOCIAL_FACILITY = {
    "group_home": "housing",
    "assisted_living": "housing",
    "nursing_home": "housing",
    "day_care": "community",
    "outreach": "community",
    "workshop": "employment",
    "ambulatory_care": "medical",
    "healthcare": "medical",
}


def osm_category(tags):
    """Map an OSM element's tags to a site category slug, or None if unmappable."""
    sf_for = tags.get("social_facility:for", "")
    for token in sf_for.replace(";", " ").split():
        if token in _SOCIAL_FOR and _SOCIAL_FOR[token]:
            return _SOCIAL_FOR[token]
    sf = tags.get("social_facility", "")
    if sf in _SOCIAL_FACILITY:
        return _SOCIAL_FACILITY[sf]
    for key, value, slug in _OSM_RULES:
        if tags.get(key) == value:
            return slug
    return None


# ---------------------------------------------------------------------------
# Strict disability-specificity gate (admin decision, September 2026)
# ---------------------------------------------------------------------------
# The directory lists organisations that SPECIFICALLY serve people with
# disabilities. Clinical therapy providers (physical, occupational, speech),
# general rehabilitation hospitals, drug & alcohol rehab, skilled nursing /
# home-health agencies and wellness businesses are NOT discovered by scrapers —
# those go in only when a real family refers them.
#
# The old rule treated a structural OSM tag (healthcare=rehabilitation,
# office=therapist, shop=medical_supply) as proof of relevance, which is what
# buried the review queue in massage parlours, marriage counsellors, dialysis
# centres and diabetic-supply shops. The rule is now DEFAULT-DENY: a candidate
# must carry an explicit disability signal to survive.

# social_facility:for values that are, on their own, proof of disability focus.
DISABILITY_SOCIAL_FOR = ("disabled", "autism")

# Explicit disability signals in a name / description / operator string.
DISABILITY_SIGNAL_KEYWORDS = (
    "disabilit", "disabled", "special needs", "special-needs",
    "autism", "autistic", "asperger", "neurodivergent", "neurodiversity",
    "down syndrome", "cerebral palsy", "spina bifida", "muscular dystrophy",
    "traumatic brain", "brain injury", "epilep", "rett syndrome",
    "fragile x", "prader-willi", "angelman",
    "deaf", "hard of hearing", "hearing impair", "hearing loss",
    "blind", "low vision", "visually impair", "vision impair",
    "wheelchair", "adaptive", "assistive", "augmentative",
    "accessib", "barrier-free", "universal design",
    "the arc ", "arc of", "easterseals", "easter seals",
    "independent living", " habilitation", "self-advocacy", "self advocacy",
    "developmental disab", "intellectual disab", " idd ",
    "special education", "early intervention", "iep",
    "respite", "caregiver", "sibling support",
    "therapeutic riding", "equine assisted", "equine-assisted", "hippotherapy",
    "adaptive sports", "adaptive recreation", "paralympic", "amputee",
    "prosthetic", "orthotic", "seating & mobility", "seating and mobility",
    "mobility equipment", "mobility scooter", "wheelchair van",
    "group home", "day habilitation", "supported employment",
    "sheltered workshop", "vocational rehabilitation",
    "department of rehabilitation", "dept of rehabilitation",
    "division of rehabilitation", "rehabilitation services administration",
)

# Tier 1 — always disqualifying, even with an explicit disability tag.
# Addiction treatment and wellness/beauty businesses are out of scope entirely.
HARD_EXCLUDE_KEYWORDS = (
    "drug rehab", "alcohol", "addiction", "addicted", "detox", "sober",
    "substance abuse", "substance use", "methadone", "opioid", "narcotic",
    "recovery center", "recovery centre", "treatment center for addiction",
    "massage", "med spa", "medspa", " spa", "wellness", "holistic",
    "acupunctur", "chiropract", "naturopath", "reiki", "yoga", "pilates",
    "weight loss", "aesthetic", "psychedelic", "ketamine", "cbd",
    "healing touch", "life coach",
    "physical therap", "physiotherap", "occupational therap", "speech therap",
    "speech-language", "sports medicine", "sports rehab", "orthopedic",
    "orthopaedic", "spinal decompression", "pain management", "pain clinic",
    "rehabilitation hospital", "rehab hospital", "outpatient rehab",
    "family therap", "marriage", "psycholog", "nursing service",
    "home health", "home care", "home nursing", "personal care services",
    "eating disorder", "psyd", "post acute", "post-acute",
    "skilled nursing", "nursing home", "nursing facility", "nursing center",
    "assisted living", "retirement", "hospice", "senior living",
)

# Tier 2 — generic clinical / eldercare services. Disqualifying UNLESS the
# candidate carries a structured disability tag (a voc-rehab centre tagged
# social_facility:for=disabled is a real resource despite the word "rehab").
SOFT_EXCLUDE_KEYWORDS = (
    "spine", "rehabilitation center",
    "rehabilitation centre", "rehab center", "rehab centre", "rehab services",
    "dialysis", "urgent care", "walk-in clinic",
    "dental", "dentist", "pharmacy", "podiatr", "dermatolog",
    "medical supply", "medical supplies", "diabetic", "oxygen",
)


def _norm(text):
    """Lowercase, space-pad, and flatten OSM punctuation so tag values like
    "medical_supply" / "child;disabled" match the plain-English keyword lists."""
    return " " + (text or "").lower().replace("_", " ").replace(";", " ") + " "


def _structured_disability_tag(tags):
    """True if source tags themselves declare a disability focus."""
    tags = tags or {}
    sf_for = str(tags.get("social_facility:for", "")).lower()
    if any(v in sf_for for v in DISABILITY_SOCIAL_FOR):
        return True
    for key in ("for", "healthcare:for", "target"):
        if any(v in str(tags.get(key, "")).lower() for v in DISABILITY_SOCIAL_FOR):
            return True
    return False


def is_disability_specific(name, tags=None, description="", extra=""):
    """Default-deny gate. True only when a candidate explicitly serves people
    with disabilities and is not a clinical-therapy, addiction, wellness or
    eldercare business. Replaces the permissive structural test retired in
    September 2026.

    name        organisation name — the strongest evidence, and the only text
                the always-disqualifying tier is judged on, so that an Arc
                chapter whose blurb happens to mention therapy isn't dropped.
    tags        source tag dict (OSM). A social_facility:for=disabled|autism
                tag is proof of focus on its own.
    description free text; contributes signals but cannot trigger a hard drop.
    extra       joined tag values, source category strings, etc.
    """
    name_blob = _norm(name)
    hard_blob = _norm(f"{name} {extra}")
    full_blob = _norm(f"{name} {description} {extra}")

    # Tier 1 — never in scope, whatever the tags say.
    if any(kw in hard_blob for kw in HARD_EXCLUDE_KEYWORDS):
        return False

    structured = _structured_disability_tag(tags)

    # An explicit signal in the NAME is the organisation describing itself as
    # disability-serving ("Adaptive Mobility", "Autism Society") — that beats
    # the generic-clinical tier below.
    if any(kw in name_blob for kw in DISABILITY_SIGNAL_KEYWORDS):
        return True

    # Tier 2 — generic clinical / eldercare. A structured disability tag
    # rescues these (a voc-rehab centre tagged for=disabled is a real resource).
    if not structured and any(kw in full_blob for kw in SOFT_EXCLUDE_KEYWORDS):
        return False
    if structured:
        return True

    return any(kw in full_blob for kw in DISABILITY_SIGNAL_KEYWORDS)


def is_disability_relevant(text, tags=None):
    """Back-compat alias for call sites that only have one text blob."""
    return is_disability_specific(text, tags)


def is_noise(text):
    """True if the text looks like a non-disability (e.g. senior-only) row and
    carries no relevance keyword."""
    blob = (text or "").lower()
    if any(kw in blob for kw in RELEVANCE_KEYWORDS):
        return False
    return any(kw in blob for kw in NOISE_KEYWORDS)


def safe_category(slug):
    """Return slug if it's a real site category, else 'other'."""
    return slug if slug in SITE_CATEGORIES else "other"
