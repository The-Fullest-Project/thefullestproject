"""RETIRED: Northern Virginia pilot catalog.

The hand-curated NoVA resources this module used to seed now live permanently in
``src/_data/resources/states/VA.json`` (location "Virginia") and are maintained
through the admin review portal. They were folded in by
``scripts/migrate-pilot-files.js`` when the pilot files (nova.json / portland.json)
were retired at launch.

This module no longer writes anything. Re-asserting the old seed list would
overwrite curated/edited VA.json entries (``save_resources`` replaces matched
entries via ``merge_resources``) and re-queue duplicates, so ``scrape()`` is
intentionally a no-op. It is kept so ``run_all.py`` still finds a ``scrape()``
and for historical reference — see git history for the original SOURCES catalog.
"""


def scrape():
    """No-op: NoVA resources are now maintained in states/VA.json via the portal."""
    print("nova_resources: retired — NoVA resources now live in "
          "states/VA.json (portal-maintained). Nothing written.")


if __name__ == '__main__':
    scrape()
