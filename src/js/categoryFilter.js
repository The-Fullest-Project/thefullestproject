// Category-page filtering: search + state + city/region on resource cards.
// Generalizes the proven resourceFilter.js data-attribute pattern for the
// per-category pages (no category dropdown — the page IS the category).
document.addEventListener('DOMContentLoaded', function() {
  var grid = document.getElementById('category-grid');
  if (!grid) return;

  var searchInput = document.getElementById('category-search');
  var stateFilter = document.getElementById('state-filter');
  var cityFilter = document.getElementById('city-filter');
  var resultsCount = document.getElementById('results-count');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.resource-card'));

  // Region-to-city mapping (same map as resourceFilter.js): selecting a region
  // also matches resources tagged with its sub-cities
  var regionCities = {
    'northern virginia': ['fairfax', 'fairfax county', 'arlington', 'alexandria', 'mclean', 'vienna', 'tysons', 'reston', 'herndon', 'sterling', 'ashburn', 'leesburg', 'purcellville', 'lovettsville', 'manassas', 'woodbridge', 'springfield', 'annandale', 'chantilly', 'centreville', 'burke', 'oakton', 'great falls', 'falls church', 'clifton', 'lorton', 'north potomac', 'warrenton'],
    'hampton roads': ['virginia beach', 'norfolk', 'hampton', 'newport news', 'chesapeake', 'portsmouth', 'suffolk'],
    'richmond': ['henrico', 'midlothian', 'glen allen'],
    'roanoke': ['salem', 'boones mill'],
    'shenandoah valley': ['harrisonburg', 'staunton', 'winchester']
  };

  function titleCase(s) {
    return s.replace(/\b\w/g, function(c) { return c.toUpperCase(); });
  }

  // Populate the city dropdown from the cards visible under the current state
  function populateCityFilter() {
    if (!cityFilter) return;
    var selectedState = stateFilter ? stateFilter.value : '';
    var previous = cityFilter.value;
    var areas = {};
    cards.forEach(function(card) {
      if (selectedState && card.getAttribute('data-location') !== selectedState) return;
      var area = card.getAttribute('data-area');
      if (area) areas[area] = true;
    });
    // Offer regions when their state is selected (or no state filter)
    if (!selectedState || selectedState === 'Virginia') {
      Object.keys(regionCities).forEach(function(region) { areas[region] = true; });
    }
    while (cityFilter.options.length > 1) cityFilter.remove(1);
    Object.keys(areas).sort().forEach(function(area) {
      var opt = document.createElement('option');
      opt.value = area;
      opt.textContent = titleCase(area);
      cityFilter.appendChild(opt);
    });
    cityFilter.value = previous;
    if (cityFilter.selectedIndex === -1) cityFilter.value = '';
  }

  function areaMatchesFilter(resourceArea, selectedArea) {
    if (!selectedArea) return true;
    if (resourceArea === selectedArea) return true;
    var cities = regionCities[selectedArea];
    return Boolean(cities && cities.indexOf(resourceArea) !== -1);
  }

  function filterCards() {
    var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var selectedState = stateFilter ? stateFilter.value : '';
    var selectedCity = cityFilter ? cityFilter.value : '';
    var visibleCount = 0;

    cards.forEach(function(card) {
      var name = card.getAttribute('data-name') || '';
      var description = card.getAttribute('data-description') || '';
      var location = card.getAttribute('data-location') || '';
      var area = card.getAttribute('data-area') || '';
      var show = true;

      if (searchTerm && !name.includes(searchTerm) && !description.includes(searchTerm) && !area.includes(searchTerm)) {
        show = false;
      }
      // "National" resources stay visible under any state filter — they serve everyone
      if (selectedState && location !== selectedState && location !== 'National') {
        show = false;
      }
      if (selectedCity && !areaMatchesFilter(area, selectedCity)) {
        show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    if (resultsCount) {
      resultsCount.textContent = visibleCount + ' resource' + (visibleCount !== 1 ? 's' : '') + ' shown';
    }
  }

  // URL param support, e.g. ?state=Virginia&city=northern%20virginia
  var params = new URLSearchParams(window.location.search);
  if (params.get('state') && stateFilter) stateFilter.value = params.get('state');
  populateCityFilter();
  if (params.get('city') && cityFilter) cityFilter.value = params.get('city').toLowerCase();

  if (searchInput) searchInput.addEventListener('input', filterCards);
  if (stateFilter) stateFilter.addEventListener('change', function() {
    populateCityFilter();
    filterCards();
  });
  if (cityFilter) cityFilter.addEventListener('change', filterCards);

  filterCards();
});
