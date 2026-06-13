"""Free structured-data extraction from an organization's homepage.

Verified by live recon: parsing <script type="application/ld+json"> + OpenGraph/
meta tags + tel: hrefs reliably fills name/website/description at ~100% on sites
that return real HTML (e.g. thearc.org, thearcofnova.org). Phone is NEVER taken
from a body-text regex (the recon proved that yields garbage like "024-507-1280"
from CSS sprite coords) — only from a tel: href. Location and category are never
trusted from markup.

An optional, default-OFF Claude Haiku fallback can fill the residual fields
(phone, inferred location, category) and handle bot-protected/JS-only sites.
It needs ANTHROPIC_API_KEY and costs per token, so it stays OFF unless the user
opts in via env TFP_LLM_ENRICH=1. The site runs fully free with it off; reviewers
fill any gaps by hand.

Lives in scrapers/ (not sources/) so run_all.py never auto-runs it.
"""

import json
import os
import re
import urllib.request

USER_AGENT = ("Mozilla/5.0 (compatible; TheFullestProjectBot/1.0; "
             "+https://thefullestproject.org/about/)")
LLM_ENABLED = os.environ.get("TFP_LLM_ENRICH", "") in ("1", "true", "yes")


def fetch_html(url, timeout=20):
    """Fetch a page's HTML, or '' on any failure / non-HTML / bot wall."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            ctype = resp.headers.get("Content-Type", "")
            if "html" not in ctype and ctype:
                return ""
            raw = resp.read(600_000)  # cap; org homepages are small
        html = raw.decode("utf-8", errors="replace")
        # Bot-challenge pages are tiny (recon saw a 212-byte Incapsula wall)
        if len(html) < 500:
            return ""
        return html
    except Exception as e:
        print(f"  extraction: could not fetch {url}: {e}")
        return ""


def _iter_jsonld(html):
    for block in re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.DOTALL | re.IGNORECASE):
        try:
            data = json.loads(block.strip())
        except (json.JSONDecodeError, ValueError):
            continue
        if isinstance(data, list):
            yield from (d for d in data if isinstance(d, dict))
        elif isinstance(data, dict):
            if isinstance(data.get("@graph"), list):
                yield from (d for d in data["@graph"] if isinstance(d, dict))
            else:
                yield data


def _meta(html, prop):
    for pat in (
        rf'<meta[^>]+property=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{re.escape(prop)}["\']',
        rf'<meta[^>]+name=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']+)["\']',
    ):
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            return m.group(1).strip()
    return ""


def extract_structured(html, url=""):
    """Return {name, website, description, phone} filled from structured markup.
    Empty strings for whatever isn't reliably present. No body-text guessing."""
    out = {"name": "", "website": url, "description": "", "phone": ""}
    if not html:
        return out

    ORG_TYPES = {"Organization", "NGO", "LocalBusiness", "NonprofitType",
                 "MedicalOrganization", "MedicalBusiness", "GovernmentOrganization"}
    for node in _iter_jsonld(html):
        types = node.get("@type", "")
        types = types if isinstance(types, list) else [types]
        if not (ORG_TYPES & set(types)):
            continue
        out["name"] = out["name"] or str(node.get("name", "")).strip()
        out["description"] = out["description"] or str(node.get("description", "")).strip()
        if node.get("url"):
            out["website"] = str(node["url"]).strip()
        tel = node.get("telephone")
        if tel:
            out["phone"] = out["phone"] or str(tel).strip()

    out["name"] = out["name"] or _meta(html, "og:site_name") or _meta(html, "og:title")
    out["description"] = out["description"] or _meta(html, "og:description") or _meta(html, "description")

    if not out["phone"]:
        m = re.search(r'href=["\']tel:([+\d().\- ]{7,})["\']', html, re.IGNORECASE)
        if m:
            out["phone"] = m.group(1).strip()

    return out


def enrich(url, missing_fields):
    """Best-effort fill of missing fields for a candidate org URL.

    Free tier always runs (structured markup). The Claude Haiku fallback only
    runs for still-missing fields when TFP_LLM_ENRICH is enabled. Returns a dict
    of whatever could be filled; never raises.
    """
    html = fetch_html(url)
    result = extract_structured(html, url)
    if not LLM_ENABLED:
        return {k: v for k, v in result.items() if v}

    still_missing = [f for f in missing_fields if not result.get(f)]
    if html and still_missing:
        try:
            result.update(_llm_extract(html, still_missing))
        except Exception as e:
            print(f"  extraction: LLM enrich skipped ({e})")
    return {k: v for k, v in result.items() if v}


def _llm_extract(html, fields):
    """Optional Claude Haiku extraction of residual fields. Off by default.

    Kept import-local so the module has no hard dependency on the SDK when the
    feature is disabled (the default).
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return {}
    # Trim to the visible-ish text to keep tokens tiny.
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)[:6000]
    prompt = (
        "Extract these fields about the organization from the page text as JSON "
        f"with exactly these keys {fields}. Use \"\" if unknown. For 'category' "
        "choose one slug from: therapy, medical, mental-health, respite, community, "
        "nonprofit, recreation, sports, education, housing, equipment, assistive-tech, "
        "employment, legal, other. Page text:\n" + text
    )
    import anthropic  # local import; only when enabled + installed
    client = anthropic.Anthropic(api_key=api_key)
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    return json.loads(m.group(0)) if m else {}
