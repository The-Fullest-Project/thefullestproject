"""Tests for the pending-review store and the save_resources gating split.

Run with:  python scrapers/test_pending_store.py
(stdlib unittest only — no extra dependencies)
"""

import importlib
import json
import os
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))


class PendingStoreTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        base = self.tmp.name
        os.environ['TFP_PENDING_DIR'] = os.path.join(base, 'pending')
        os.environ['TFP_OUTPUT_DIR'] = os.path.join(base, 'output')
        os.environ['TFP_DATA_DIR'] = os.path.join(base, 'data')
        os.environ['TFP_BLOCKLIST_FILE'] = os.path.join(base, 'blocklist.json')
        import pending_store
        import base_scraper
        self.ps = importlib.reload(pending_store)
        self.bs = importlib.reload(base_scraper)

    def tearDown(self):
        for var in ('TFP_PENDING_DIR', 'TFP_OUTPUT_DIR', 'TFP_DATA_DIR', 'TFP_BLOCKLIST_FILE'):
            os.environ.pop(var, None)
        self.tmp.cleanup()
        # Restore real paths for any later imports in the same process
        import pending_store
        import base_scraper
        importlib.reload(pending_store)
        importlib.reload(base_scraper)

    # ── id determinism ──────────────────────────────────────────────────────

    def test_new_id_is_deterministic(self):
        payload = {"name": "Test Org", "location": "Virginia"}
        self.assertEqual(self.ps.new_id("resource", payload),
                         self.ps.new_id("resource", payload))
        other = {"name": "Other Org", "location": "Virginia"}
        self.assertNotEqual(self.ps.new_id("resource", payload),
                            self.ps.new_id("resource", other))
        self.assertTrue(self.ps.new_id("resource", payload).startswith("res-"))

    # ── queueing and dedup ──────────────────────────────────────────────────

    def test_queue_items_dedups_within_run(self):
        payload = {"name": "Dup Org", "location": "National"}
        envs = [self.ps.make_envelope("resource", payload, "test"),
                self.ps.make_envelope("resource", payload, "test")]
        self.assertEqual(self.ps.queue_items("resource", envs), 1)
        # second call with the same item also queues nothing
        self.assertEqual(self.ps.queue_items(
            "resource", [self.ps.make_envelope("resource", payload, "test")]), 0)
        items = list(self.ps.iter_pending("resource"))
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["origin"]["type"], "scraper")

    def test_load_pending_keys_includes_submissions_for_resources(self):
        scraped = {"name": "Scraped Org", "location": "Oregon"}
        self.ps.queue_items("resource", [self.ps.make_envelope("resource", scraped, "test")])
        os.makedirs(self.ps.PENDING_DIR, exist_ok=True)
        submission = self.ps.make_envelope(
            "submission", {"name": "Submitted Org", "location": "Texas"},
            "submit-resource-form", origin_type="submission")
        with open(self.ps.SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump([submission], f)
        keys = self.ps.load_pending_keys("resource")
        # keys are normalized (case/whitespace-insensitive) via resource_key
        self.assertIn(("scraped org", "oregon"), keys)
        self.assertIn(("submitted org", "texas"), keys)

    def test_load_pending_keys_blog_has_urls_and_slugs(self):
        payload = {"title": "An Article", "url": "https://example.org/a", "slug": "an-article"}
        self.ps.queue_items("blog", [self.ps.make_envelope("blog", payload, "test")])
        keys = self.ps.load_pending_keys("blog")
        self.assertIn("https://example.org/a", keys)
        self.assertIn("an-article", keys)

    # ── pruning ─────────────────────────────────────────────────────────────

    def test_prune_drops_stale_news_keeps_resources(self):
        old = (datetime.now(timezone.utc) - timedelta(days=40)).isoformat()
        stale_story = self.ps.make_envelope(
            "story", {"title": "Old Story", "sourceUrl": "https://example.org/old"}, "test")
        stale_story["origin"]["submittedAt"] = old
        fresh_story = self.ps.make_envelope(
            "story", {"title": "Fresh Story", "sourceUrl": "https://example.org/new"}, "test")
        old_resource = self.ps.make_envelope(
            "resource", {"name": "Old Resource", "location": "National"}, "test")
        old_resource["origin"]["submittedAt"] = old

        self.ps.queue_items("story", [stale_story, fresh_story])
        self.ps.queue_items("resource", [old_resource])

        pruned = self.ps.prune_stale(max_age_days=28)
        self.assertEqual([p["title"] for p in pruned], ["Old Story"])
        remaining = list(self.ps.iter_pending())
        types = sorted(e["type"] for e in remaining)
        self.assertEqual(types, ["resource", "story"])

    def test_prune_deletes_emptied_batch_file(self):
        old = (datetime.now(timezone.utc) - timedelta(days=40)).isoformat()
        env = self.ps.make_envelope(
            "blog", {"title": "Old", "url": "https://example.org/x", "slug": "old"}, "test")
        env["origin"]["submittedAt"] = old
        self.ps.queue_items("blog", [env])
        batch_files = os.listdir(self.ps.SCRAPED_DIR)
        self.assertEqual(len(batch_files), 1)
        self.ps.prune_stale(max_age_days=28)
        self.assertEqual(os.listdir(self.ps.SCRAPED_DIR), [])

    # ── save_resources gating split ─────────────────────────────────────────

    def _seed_live(self, filename, entries):
        path = os.path.join(self.bs.DATA_DIR, filename)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(entries, f)

    def test_save_resources_updates_live_and_queues_new(self):
        live = self.bs.make_resource("Existing Org", ["therapy"], "Virginia", "desc")
        self._seed_live("states/VA.json", [live])

        updated = self.bs.make_resource("Existing Org", ["therapy"], "Virginia",
                                        "updated description")
        brand_new = self.bs.make_resource("New Org", ["respite"], "Virginia", "new")
        merged = self.bs.merge_resources([live], [updated, brand_new])
        self.bs.save_resources(merged, "states/VA.json", origin_detail="test_scraper")

        with open(os.path.join(self.bs.DATA_DIR, "states/VA.json"), encoding="utf-8") as f:
            live_after = json.load(f)
        self.assertEqual(len(live_after), 1)
        self.assertEqual(live_after[0]["description"], "updated description")

        queued = list(self.ps.iter_pending("resource"))
        self.assertEqual(len(queued), 1)
        self.assertEqual(queued[0]["payload"]["name"], "New Org")
        self.assertEqual(queued[0]["origin"]["detail"], "test_scraper")
        self.assertEqual(queued[0]["targetFile"], "src/_data/resources/states/VA.json")

    def test_save_resources_second_run_queues_nothing(self):
        self._seed_live("national.json", [])
        new = self.bs.make_resource("Once Org", ["camps"], "National", "d")
        self.bs.save_resources([new], "national.json", origin_detail="test")
        self.bs.save_resources([new], "national.json", origin_detail="test")
        self.assertEqual(len(list(self.ps.iter_pending("resource"))), 1)

    def test_save_resources_skips_items_live_in_other_files(self):
        cross = self.bs.make_resource("Cross Org", ["legal"], "National", "d")
        self._seed_live("national.json", [cross])
        self._seed_live("nova.json", [])
        self.bs.save_resources([cross], "nova.json", origin_detail="test")
        self.assertEqual(len(list(self.ps.iter_pending("resource"))), 0)

    def test_dedup_is_case_and_whitespace_insensitive(self):
        live = self.bs.make_resource("Arc of NoVA", ["nonprofit"], "Virginia", "d")
        self._seed_live("states/VA.json", [live])
        # Same org, different case/spacing — must NOT be queued as a duplicate
        variant = self.bs.make_resource("  ARC OF NOVA ", ["nonprofit"], "virginia", "d2")
        queued, _ = self.bs.queue_new_resources([variant], "test")
        self.assertEqual(queued, 0)
        self.assertEqual(len(list(self.ps.iter_pending("resource"))), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
