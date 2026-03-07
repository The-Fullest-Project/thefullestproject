document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const locationFilter = document.getElementById('location-filter');
  const categoryFilter = document.getElementById('category-filter');
  const resourceGrid = document.getElementById('resource-grid');
  const resultsCount = document.getElementById('results-count');

  if (!resourceGrid) return;

  const cards = resourceGrid.querySelectorAll('.resource-card');

  // Check URL params for initial filter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('location') && locationFilter) {
    const loc = urlParams.get('location');
    // Try direct match first (full state name or "National")
    const options = Array.from(locationFilter.options);
    const match = options.find(o => o.value === loc || o.value.toLowerCase() === loc.toLowerCase());
    if (match) {
      locationFilter.value = match.value;
    }
  }
  if (urlParams.get('category') && categoryFilter) {
    categoryFilter.value = urlParams.get('category');
  }

  function filterResources() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedLocation = locationFilter ? locationFilter.value : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';

    let visibleCount = 0;

    cards.forEach(function(card) {
      const name = card.getAttribute('data-name') || '';
      const description = card.getAttribute('data-description') || '';
      const location = card.getAttribute('data-location') || '';
      const categories = card.getAttribute('data-category') || '';

      let show = true;

      // Search filter
      if (searchTerm && !name.includes(searchTerm) && !description.includes(searchTerm)) {
        show = false;
      }

      // Location filter
      if (selectedLocation && location !== selectedLocation) {
        show = false;
      }

      // Category filter
      if (selectedCategory && !categories.includes(selectedCategory)) {
        show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    if (resultsCount) {
      resultsCount.textContent = visibleCount + ' resource' + (visibleCount !== 1 ? 's' : '') + ' found';
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterResources);
  if (locationFilter) locationFilter.addEventListener('change', filterResources);
  if (categoryFilter) categoryFilter.addEventListener('change', filterResources);

  // Run initial filter
  filterResources();
});
