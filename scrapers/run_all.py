"""Run all scrapers and update resource data."""

import sys
import os
import importlib

# Add scrapers directory to path
sys.path.insert(0, os.path.dirname(__file__))


def run_all():
    """Run all scraper modules in the sources directory."""
    sources_dir = os.path.join(os.path.dirname(__file__), 'sources')

    if not os.path.exists(sources_dir):
        print("No sources directory found. Creating it...")
        os.makedirs(sources_dir, exist_ok=True)
        print("Add scraper modules to scrapers/sources/ to begin scraping.")
        return

    scraper_files = [
        f[:-3] for f in os.listdir(sources_dir)
        if f.endswith('.py') and not f.startswith('_')
    ]

    if not scraper_files:
        print("No scraper modules found in scrapers/sources/")
        print("Add .py files to scrapers/sources/ to begin scraping.")
        return

    print(f"Found {len(scraper_files)} scraper(s): {', '.join(scraper_files)}")
    print("=" * 60)

    for scraper_name in scraper_files:
        print(f"\nRunning {scraper_name}...")
        try:
            module = importlib.import_module(f'sources.{scraper_name}')
            if hasattr(module, 'scrape'):
                module.scrape()
                print(f"  {scraper_name} completed successfully.")
            else:
                print(f"  WARNING: {scraper_name} has no scrape() function, skipping.")
        except Exception as e:
            print(f"  ERROR in {scraper_name}: {e}")

    print("\n" + "=" * 60)
    print("All scrapers finished.")


if __name__ == '__main__':
    run_all()
