"""Offline unit tests for the discovery scraper helpers (no network).

Run:  python scrapers/test_discovery_scrapers.py
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))

import _category_map as cm
import _extraction as ex


class CategoryMapTests(unittest.TestCase):
    def test_state_tables_complete(self):
        self.assertEqual(len(cm.STATE_NAME), 51)  # 50 + DC
        self.assertEqual(cm.STATE_NAME["OR"], "Oregon")
        self.assertEqual(cm.STATE_CODE["Virginia"], "VA")
        self.assertEqual(len(cm.ALL_STATE_CODES), 51)

    def test_emitted_categories_are_valid_slugs(self):
        # Every slug the OSM map can emit must exist in the site taxonomy
        for _k, _v, slug in cm._OSM_RULES:
            self.assertIn(slug, cm.SITE_CATEGORIES, f"{slug} not a site category")
        for slug in cm._SOCIAL_FOR.values():
            if slug:
                self.assertIn(slug, cm.SITE_CATEGORIES)
        for slug in cm._SOCIAL_FACILITY.values():
            self.assertIn(slug, cm.SITE_CATEGORIES)

    def test_osm_category_mapping(self):
        self.assertEqual(cm.osm_category({"office": "therapist"}), "therapy")
        self.assertEqual(cm.osm_category({"healthcare": "rehabilitation"}), "therapy")
        self.assertEqual(cm.osm_category({"social_facility:for": "disabled"}), "community")
        # mental-health is out of scope for scraping — no longer mapped
        self.assertIsNone(cm.osm_category({"social_facility:for": "mental_health"}))
        self.assertIsNone(cm.osm_category({"healthcare": "psychotherapist"}))
        self.assertEqual(cm.osm_category({"shop": "mobility"}), "equipment")
        self.assertEqual(cm.osm_category({"social_facility": "group_home"}), "housing")
        self.assertIsNone(cm.osm_category({"amenity": "cafe"}))

    def test_excluded_categories(self):
        # mental-health / chiropractic / behavioral-health are dropped
        self.assertTrue(cm.is_excluded("Riverbend Community Mental Health"))
        self.assertTrue(cm.is_excluded("Prince William Family Counseling"))
        self.assertTrue(cm.is_excluded("Short Pump Chiropractic Center"))
        self.assertTrue(cm.is_excluded("Inova Behavioral Health Services"))
        self.assertTrue(cm.is_excluded("Anyone", {"healthcare": "psychotherapist"}))
        self.assertTrue(cm.is_excluded("Anyone", {"social_facility:for": "mental_health"}))
        # genuine disability resources are NOT excluded
        self.assertFalse(cm.is_excluded("Pediatric Speech Therapy Clinic"))
        self.assertFalse(cm.is_excluded("Adaptive Equipment Loan Closet"))
        self.assertFalse(cm.is_excluded("Genetic Counseling & Rare Disease Center"))

    def test_safe_category(self):
        self.assertEqual(cm.safe_category("therapy"), "therapy")
        self.assertEqual(cm.safe_category("made-up-slug"), "other")

    def test_keeps_explicit_disability_organisations(self):
        keep = cm.is_disability_specific
        self.assertTrue(keep("Autism Support Center of Richmond"))
        self.assertTrue(keep("The Arc Eastern Connecticut"))
        self.assertTrue(keep("Lynchburg Area Center for Independent Living"))
        self.assertTrue(keep("Down Syndrome Association of Minnesota"))
        self.assertTrue(keep("NC Therapeutic Riding Center"))
        self.assertTrue(keep("Lanakila Center For The Blind"))
        # Name declares a disability focus, so a generic shop tag can't veto it
        self.assertTrue(keep("National Seating & Mobility", {}, "", "osm medical_supply"))

    def test_drops_clinical_therapy_and_wellness(self):
        """September 2026 admin decision: therapy/rehab/wellness providers are
        added by family referral, never scraped."""
        drop = lambda *a: self.assertFalse(cm.is_disability_specific(*a))
        drop("Pediatric Occupational Therapy Clinic")
        drop("Mosaic Pediatric Therapy", {}, "", "osm therapist")
        drop("Spine and Orthopedic Rehab", {}, "", "osm rehabilitation")
        drop("Asian Massage", {}, "", "osm therapist")
        drop("Bacon Street Marriage & Family Therapist")
        drop("Virtue Recovery Center Las Vegas")
        drop("Continuing Care Well Spirit Holistic Health")
        drop("DaVita Home Dialysis", {}, "", "osm medical_supply")
        drop("Discount Diabetic Supplies", {}, "", "osm medical_supply")
        drop("CAREGIVERS HOME HEALTH SERVICES INC", {}, "", "cms home-health")
        drop("Joe's Pizzeria and Grill")

    def test_structured_tag_rescues_generic_names_only(self):
        keep = cm.is_disability_specific
        # OSM says the facility serves disabled people -> in scope
        self.assertTrue(keep("Maple House", {"social_facility:for": "disabled"}))
        self.assertTrue(keep("West Central Alabama Rehabilitation Center",
                             {"social_facility:for": "disabled"}))
        # ...but it cannot rescue an always-out-of-scope service type
        self.assertFalse(keep("Harmony Manor Skilled Nursing Facility",
                              {"social_facility:for": "disabled"}))
        self.assertFalse(keep("Reno Triangle Club",
                              {"social_facility:for": "drug_addicted"}))
        self.assertFalse(keep("Maple House", {"social_facility:for": "senior"}))
        # A structural clinical tag is no longer sufficient on its own
        self.assertFalse(keep("Downtown Clinic", {"healthcare": "rehabilitation"}))

    def test_noise_filter(self):
        self.assertTrue(cm.is_noise("Sunset Senior Center retirement living"))
        # noise word but also a relevance word -> NOT noise (keep for review)
        self.assertFalse(cm.is_noise("Senior Center disability support program"))
        self.assertFalse(cm.is_noise("Adaptive Sports Foundation"))


class ExtractionTests(unittest.TestCase):
    JSONLD_PAGE = """<html><head>
      <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"NGO",
       "name":"Arc of Example County",
       "url":"https://arcexample.org/",
       "description":"Supports people with intellectual and developmental disabilities.",
       "telephone":"(555) 123-4567"}
      </script></head><body><a href="tel:+15551234567">Call us</a></body></html>"""

    OG_ONLY_PAGE = """<html><head>
      <meta property="og:site_name" content="Hope Therapy Center">
      <meta property="og:description" content="Pediatric speech and OT services.">
      </head><body><a href="tel:555-987-6543">phone</a></body></html>"""

    BOT_WALL = "<html><body>challenge</body></html>"  # < 500 bytes

    def test_jsonld_extraction(self):
        out = ex.extract_structured(self.JSONLD_PAGE, "https://arcexample.org/")
        self.assertEqual(out["name"], "Arc of Example County")
        self.assertEqual(out["website"], "https://arcexample.org/")
        self.assertIn("developmental disabilities", out["description"])
        self.assertEqual(out["phone"], "(555) 123-4567")

    def test_og_meta_and_tel_fallback(self):
        out = ex.extract_structured(self.OG_ONLY_PAGE, "https://hopetherapy.org/")
        self.assertEqual(out["name"], "Hope Therapy Center")
        self.assertIn("speech", out["description"])
        self.assertEqual(out["phone"], "555-987-6543")  # from tel: href, not body regex

    def test_empty_on_no_html(self):
        out = ex.extract_structured("", "https://x.org/")
        self.assertEqual(out["name"], "")
        self.assertEqual(out["website"], "https://x.org/")

    def test_no_phone_invented_from_body(self):
        # body has number-like noise but no tel: href and no JSON-LD telephone
        page = "<html><head><title>x</title></head><body>grid 024-507-1280 sprite" + " x" * 300 + "</body></html>"
        out = ex.extract_structured(page, "https://x.org/")
        self.assertEqual(out["phone"], "")  # must NOT scrape garbage from body


if __name__ == "__main__":
    unittest.main(verbosity=2)
