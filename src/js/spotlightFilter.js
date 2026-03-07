document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('spotlight-search');
  const categoryFilter = document.getElementById('spotlight-category');
  const grid = document.getElementById('spotlight-grid');
  const countDisplay = document.getElementById('spotlight-count');

  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('[data-name]'));

  function filterSpotlights() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : '';
    let visibleCount = 0;

    cards.forEach(function(card) {
      const name = card.getAttribute('data-name') || '';
      const category = card.getAttribute('data-category') || '';
      const description = card.getAttribute('data-description') || '';

      const matchesSearch = !searchTerm ||
        name.includes(searchTerm) ||
        description.includes(searchTerm);

      const matchesCategory = !selectedCategory ||
        category === selectedCategory;

      if (matchesSearch && matchesCategory) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countDisplay) {
      countDisplay.textContent = visibleCount + ' spotlight' + (visibleCount !== 1 ? 's' : '');
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterSpotlights);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterSpotlights);
  }

  filterSpotlights();
});
