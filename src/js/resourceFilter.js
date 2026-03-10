document.addEventListener('DOMContentLoaded', function() {
  var searchInput = document.getElementById('search-input');
  var locationFilter = document.getElementById('location-filter');
  var areaFilter = document.getElementById('area-filter');
  var categoryFilter = document.getElementById('category-filter');
  var resourceGrid = document.getElementById('resource-grid');
  var resultsCount = document.getElementById('results-count');

  if (!resourceGrid) return;

  var cards = resourceGrid.querySelectorAll('.resource-card');

  // Build area options from data
  function populateAreaFilter() {
    if (!areaFilter) return;
    var selectedLocation = locationFilter ? locationFilter.value : '';
    var areas = {};

    cards.forEach(function(card) {
      var area = card.getAttribute('data-area') || '';
      var location = card.getAttribute('data-location') || '';
      if (!area) return;
      if (selectedLocation && location !== selectedLocation) return;
      // Capitalize area for display
      var display = area.replace(/\b\w/g, function(c) { return c.toUpperCase(); });
      areas[area] = display;
    });

    // Sort and rebuild options
    var sorted = Object.keys(areas).sort();
    areaFilter.innerHTML = '<option value="">All Cities</option>';
    sorted.forEach(function(key) {
      var opt = document.createElement('option');
      opt.value = key;
      opt.textContent = areas[key];
      areaFilter.appendChild(opt);
    });
  }

  // Check URL params for initial filter
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('location') && locationFilter) {
    var loc = urlParams.get('location');
    var options = Array.from(locationFilter.options);
    var match = options.find(function(o) {
      return o.value === loc || o.value.toLowerCase() === loc.toLowerCase();
    });
    if (match) locationFilter.value = match.value;
  }
  if (urlParams.get('category') && categoryFilter) {
    categoryFilter.value = urlParams.get('category');
  }

  populateAreaFilter();

  if (urlParams.get('area') && areaFilter) {
    areaFilter.value = urlParams.get('area').toLowerCase();
  }

  // Region-to-city mapping: selecting a region also shows resources in its sub-areas
  var regionCities = {
    'northern virginia': ['fairfax', 'fairfax county', 'arlington', 'alexandria', 'mclean', 'vienna', 'tysons', 'reston', 'herndon', 'sterling', 'ashburn', 'leesburg', 'purcellville', 'lovettsville', 'manassas', 'woodbridge', 'springfield', 'annandale', 'chantilly', 'centreville', 'burke', 'oakton', 'great falls', 'falls church', 'clifton', 'lorton', 'north potomac', 'warrenton'],
    'hampton roads': ['virginia beach', 'norfolk', 'hampton', 'newport news', 'chesapeake', 'portsmouth', 'suffolk'],
    'richmond': ['henrico', 'midlothian', 'glen allen'],
    'roanoke': ['salem', 'boones mill'],
    'shenandoah valley': ['harrisonburg', 'staunton', 'winchester']
  };

  function areaMatchesFilter(resourceArea, selectedArea) {
    if (!selectedArea) return true;
    if (resourceArea === selectedArea) return true;
    // If a region is selected, also match its sub-cities
    var cities = regionCities[selectedArea];
    if (cities && cities.indexOf(resourceArea) !== -1) return true;
    return false;
  }

  function filterResources() {
    var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var selectedLocation = locationFilter ? locationFilter.value : '';
    var selectedArea = areaFilter ? areaFilter.value : '';
    var selectedCategory = categoryFilter ? categoryFilter.value : '';

    var visibleCount = 0;

    cards.forEach(function(card) {
      var name = card.getAttribute('data-name') || '';
      var description = card.getAttribute('data-description') || '';
      var location = card.getAttribute('data-location') || '';
      var area = card.getAttribute('data-area') || '';
      var categories = card.getAttribute('data-category') || '';

      var show = true;

      // Search filter (also searches area)
      if (searchTerm && !name.includes(searchTerm) && !description.includes(searchTerm) && !area.includes(searchTerm)) {
        show = false;
      }

      // Location filter
      if (selectedLocation && location !== selectedLocation) {
        show = false;
      }

      // Area/city filter (with region-to-city mapping)
      if (selectedArea && !areaMatchesFilter(area, selectedArea)) {
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
  if (locationFilter) {
    locationFilter.addEventListener('change', function() {
      // Reset area filter when location changes and repopulate cities
      if (areaFilter) areaFilter.value = '';
      populateAreaFilter();
      filterResources();
    });
  }
  if (areaFilter) areaFilter.addEventListener('change', filterResources);
  if (categoryFilter) categoryFilter.addEventListener('change', filterResources);

  // Run initial filter
  filterResources();
});
