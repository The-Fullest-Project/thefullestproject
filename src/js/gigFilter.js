document.addEventListener('DOMContentLoaded', function() {
  var searchInput = document.getElementById('gig-search');
  var typeFilter = document.getElementById('gig-type-filter');
  var locationFilter = document.getElementById('gig-location-filter');
  var categoryFilter = document.getElementById('gig-category-filter');
  var compensationFilter = document.getElementById('gig-compensation-filter');
  var gigGrid = document.getElementById('gig-grid');
  var resultsCount = document.getElementById('gig-results-count');

  if (!gigGrid) return;

  var cards = gigGrid.querySelectorAll('.gig-card');

  // Check URL params for initial filter
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('type') && typeFilter) typeFilter.value = urlParams.get('type');
  if (urlParams.get('location') && locationFilter) locationFilter.value = urlParams.get('location');
  if (urlParams.get('category') && categoryFilter) categoryFilter.value = urlParams.get('category');
  if (urlParams.get('compensation') && compensationFilter) compensationFilter.value = urlParams.get('compensation');

  function filterGigs() {
    var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var selectedType = typeFilter ? typeFilter.value : '';
    var selectedLocation = locationFilter ? locationFilter.value : '';
    var selectedCategory = categoryFilter ? categoryFilter.value : '';
    var selectedCompensation = compensationFilter ? compensationFilter.value : '';

    var visibleCount = 0;

    cards.forEach(function(card) {
      var name = card.getAttribute('data-name') || '';
      var description = card.getAttribute('data-description') || '';
      var type = card.getAttribute('data-type') || '';
      var location = card.getAttribute('data-location') || '';
      var category = card.getAttribute('data-category') || '';
      var compensation = card.getAttribute('data-compensation') || '';

      var show = true;

      if (searchTerm && !name.includes(searchTerm) && !description.includes(searchTerm)) {
        show = false;
      }
      if (selectedType && type !== selectedType) {
        show = false;
      }
      if (selectedLocation && location !== selectedLocation) {
        show = false;
      }
      if (selectedCategory && category !== selectedCategory) {
        show = false;
      }
      if (selectedCompensation && compensation !== selectedCompensation) {
        show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    if (resultsCount) {
      resultsCount.textContent = visibleCount + ' gig' + (visibleCount !== 1 ? 's' : '') + ' found';
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterGigs);
  if (typeFilter) typeFilter.addEventListener('change', filterGigs);
  if (locationFilter) locationFilter.addEventListener('change', filterGigs);
  if (categoryFilter) categoryFilter.addEventListener('change', filterGigs);
  if (compensationFilter) compensationFilter.addEventListener('change', filterGigs);

  filterGigs();
});
