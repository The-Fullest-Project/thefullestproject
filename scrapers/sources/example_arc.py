"""
Example scraper: The Arc chapters.
This demonstrates the scraper pattern. Each scraper should have a scrape() function.
"""

from base_scraper import make_resource, save_resources, load_existing, merge_resources


def scrape():
    """Scrape Arc chapter information.

    In a real implementation, this would use scrapling/httpx to fetch
    chapter listings from thearc.org and extract location-specific data.
    For now, this serves as a template.
    """
    # Example of what scraped data would look like:
    scraped = [
        make_resource(
            name="The Arc of Northern Virginia",
            category=["nonprofit"],
            location="Northern Virginia",
            description="Advocacy organization for people with intellectual "
                        "and developmental disabilities.",
            website="https://thearcofnova.org",
            tags=["advocacy", "intellectual-disability", "developmental"],
            source="https://thearc.org/find-a-chapter/"
        ),
    ]

    # Merge with existing data (preserves manually curated entries)
    existing = load_existing('nova.json')
    merged = merge_resources(existing, scraped)
    save_resources(merged, 'nova.json')


if __name__ == '__main__':
    scrape()
