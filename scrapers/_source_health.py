"""Fail-loud health logging for discovery scrapers.

The old scrapers silently fell back to seed data when a fetch failed, so an
outage looked identical to "nothing new this week." These helpers make a total
failure LOUD: it gets written to scrape_log.json with status FAILED (surfaced
by scrape_digest.py in the weekly email) and the scraper raises so run_all.py
reports it. A partial failure (some states down) logs a warning and continues.

Lives in scrapers/ (not sources/) so run_all.py never auto-runs it.
"""

import json
import os
from datetime import datetime
from pathlib import Path

LOG_DIR = Path(__file__).parent / "logs"


def int_env(name, default):
    """Parse an int env var, falling back (with a warning) on a bad value so a
    typo can't abort a scrape before any health entry is recorded."""
    try:
        return int(os.environ.get(name, "") or default)
    except (ValueError, TypeError):
        print(f"  warning: {name} is not an integer; using {default}")
        return default


def float_env(name, default):
    try:
        return float(os.environ.get(name, "") or default)
    except (ValueError, TypeError):
        print(f"  warning: {name} is not a number; using {default}")
        return default


class SourceRunFailed(Exception):
    """Raised when a source returned no data from ANY target (total outage)."""


class SourceRun:
    """Accumulates per-run stats and writes a scrape_log.json entry.

    Usage:
        run = SourceRun("osm_overpass")
        for state in states:
            run.attempt()
            try:
                rows = fetch(state)
                run.succeed(seen=len(rows))
            except Exception as e:
                run.fail_target(f"{state}: {e}")
        run.queued(n)
        run.finish()   # raises SourceRunFailed if every attempt failed
    """

    def __init__(self, scraper_name):
        self.scraper = scraper_name
        self.attempted = 0
        self.succeeded = 0
        self.rows_seen = 0
        self.rows_queued = 0
        self.errors = []

    def attempt(self):
        self.attempted += 1

    def succeed(self, seen=0):
        self.succeeded += 1
        self.rows_seen += seen

    def fail_target(self, message):
        self.errors.append(message)
        print(f"  [{self.scraper}] target failed: {message}")

    def queued(self, n):
        self.rows_queued += n

    def _status(self):
        if self.attempted == 0:
            return "NO_TARGETS"
        if self.succeeded == 0:
            return "FAILED"
        # Fetches succeeded but parsing yielded nothing across the whole run —
        # the tell-tale of an upstream schema change (renamed column / tag key),
        # not a genuine "nothing new". Surface it loudly rather than as OK.
        if self.rows_seen == 0 and self.succeeded > 0:
            return "PARSED_ZERO"
        if self.errors:
            return "PARTIAL"
        return "OK"

    def finish(self, raise_on_failure=True):
        status = self._status()
        self._write(status)
        summary = (f"{self.scraper}: {status} — {self.succeeded}/{self.attempted} "
                   f"targets ok, {self.rows_seen} seen, {self.rows_queued} queued")
        print(summary)
        if self.errors:
            print(f"  {len(self.errors)} target error(s); first: {self.errors[0]}")
        if status == "FAILED" and raise_on_failure:
            raise SourceRunFailed(
                f"{self.scraper} got data from 0/{self.attempted} targets — "
                f"source appears down (not just 'nothing new')."
            )
        return status

    def _write(self, status):
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        log_file = LOG_DIR / "scrape_log.json"
        logs = []
        if log_file.exists():
            try:
                with open(log_file, "r", encoding="utf-8") as f:
                    logs = json.load(f)
            except ValueError:  # includes json.JSONDecodeError
                logs = []
        logs.append({
            "scraper": self.scraper,
            "timestamp": datetime.now().isoformat(),
            "status": status,
            "targets_attempted": self.attempted,
            "targets_succeeded": self.succeeded,
            "entries_found": self.rows_seen,
            "entries_queued": self.rows_queued,
            "entries": [{"action": "error", "name": e} for e in self.errors[:10]],
        })
        logs = logs[-50:]
        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2, ensure_ascii=False)
