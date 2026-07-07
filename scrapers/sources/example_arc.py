"""Template scraper (example only — writes nothing).

Demonstrates the scraper module shape: a module in ``scrapers/sources/`` that
exports a ``scrape()`` function, auto-discovered and run by ``run_all.py``.

For a REAL, live example of automated discovery see ``osm_overpass.py``
(queue-only via ``base_scraper.queue_new_resources``). For a hand-curated
catalog that publishes/updates through the approval gate see
``national_resources.py`` (``base_scraper.save_resources``). This template
intentionally performs no writes so it can never touch live data.
"""

from base_scraper import make_resource


def scrape():
    """Build one example resource to show make_resource()'s shape, then stop.

    A real scraper would either ``queue_new_resources([...])`` for discovery or
    ``save_resources([...], 'states/XX.json')`` for a curated catalog. This
    example writes nothing.
    """
    example = make_resource(
        name="The Arc of Northern Virginia",
        category=["nonprofit"],
        location="Virginia",
        description="Advocacy organization for people with intellectual "
                    "and developmental disabilities.",
        website="https://thearcofnova.org",
        tags=["advocacy", "intellectual-disability", "developmental"],
        source="https://thearc.org/find-a-chapter/",
    )
    print(f"example_arc: template only — built 1 example "
          f"({example['name']}), wrote nothing.")


if __name__ == '__main__':
    scrape()
