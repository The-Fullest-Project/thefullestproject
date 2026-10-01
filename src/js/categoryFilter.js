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
  var typeFilter = document.getElementById('type-filter');
  var typeFilterWrap = document.getElementById('type-filter-wrap');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.resource-card'));
  var activeFacet = '';

  // When a state is chosen, in-state listings come first and national ones follow
  // under this divider. National organizations serve everyone but often have no
  // local presence, so they shouldn't be mistaken for something down the road.
  // Ordering is done with CSS `order` rather than moving nodes around.
  var nationalDivider = document.createElement('div');
  nationalDivider.className = 'col-span-full pt-6 mt-2 border-t';
  nationalDivider.style.borderColor = 'var(--color-warm)';
  nationalDivider.style.order = '2';
  nationalDivider.hidden = true;

  var dividerHeading = document.createElement('h2');
  dividerHeading.className = 'text-lg font-bold';
  dividerHeading.style.color = 'var(--color-primary)';
  dividerHeading.textContent = 'National resources';
  nationalDivider.appendChild(dividerHeading);

  var dividerNote = document.createElement('p');
  dividerNote.className = 'text-sm mt-1';
  dividerNote.style.color = 'var(--color-text-light)';
  dividerNote.textContent =
    'These serve families nationwide, so they may not have an office or staff near you.';
  nationalDivider.appendChild(dividerNote);

  grid.appendChild(nationalDivider);

  // Human labels for facet slugs (embedded by the page template)
  var facetLabels = {};
  var labelsEl = document.getElementById('subcategory-labels');
  if (labelsEl) {
    try { facetLabels = JSON.parse(labelsEl.textContent); } catch (e) { facetLabels = {}; }
  }

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

  // Merge near-synonym tag/slug variants into one chip
  var facetCanon = {
    'speech-therapy': 'therapy-speech',
    'aba-therapy': 'therapy-aba',
    'occupational-therapy': 'therapy-ot',
    'physical-therapy': 'therapy-pt',
    'hippotherapy': 'therapy-equine',
    'equine-therapy': 'therapy-equine',
    'music-therapy': 'therapy-music',
    'aquatic-therapy': 'therapy-aquatic',
    'feeding-therapy': 'therapy-feeding',
    'art-therapy': 'therapy-art',
    'equipment-loaner': 'loaner',
    'assistive-tech': 'assistive-technology',
    'mobility-equipment': 'mobility',
    'sensory-products': 'sensory',
    'adaptive-gear': 'adaptive',
    'in-home': 'home-care'
  };
  // Normalize a raw facet (lowercase, spaces -> hyphens) so variants like
  // "sensory products" and "sensory-products" collapse to one before the
  // synonym map runs — otherwise the Type dropdown shows the same label twice.
  function normFacet(f) {
    return f.trim().toLowerCase().replace(/\s+/g, '-');
  }
  function cardFacets(card) {
    return (card.getAttribute('data-facets') || '').split(',')
      .map(normFacet)
      .filter(Boolean)
      .map(function(f) { return facetCanon[f] || f; });
  }

  function facetLabel(slug) {
    if (facetLabels[slug]) return facetLabels[slug];
    return titleCase(slug.replace(/[-_]/g, ' '));
  }

  // Populate the "Type" dropdown from the facets present on this page's cards.
  // An option appears when 2+ resources share the facet (and not all of them
  // do); tagging a resource in the review portal automatically feeds this.
  function populateTypeFilter() {
    if (!typeFilter || !typeFilterWrap) return;
    var counts = {};
    cards.forEach(function(card) {
      var seen = {};
      cardFacets(card).forEach(function(f) {
        if (!seen[f]) { seen[f] = true; counts[f] = (counts[f] || 0) + 1; }
      });
    });
    var pageCategory = grid.getAttribute('data-category');
    var facets = Object.keys(counts).filter(function(f) {
      return f !== pageCategory && counts[f] >= 2 && counts[f] < cards.length;
    });
    facets.sort(function(a, b) { return counts[b] - counts[a]; });
    facets = facets.slice(0, 25).sort(function(a, b) {
      return facetLabel(a).localeCompare(facetLabel(b));
    });
    if (facets.length === 0) return;

    typeFilterWrap.hidden = false;
    facets.forEach(function(f) {
      var opt = document.createElement('option');
      opt.value = f;
      opt.textContent = facetLabel(f) + ' (' + counts[f] + ')';
      typeFilter.appendChild(opt);
    });
    typeFilter.addEventListener('change', function() {
      activeFacet = typeFilter.value;
      filterCards();
    });
  }

  /**
   * Sets a card's position relative to the national divider.
   * Returns true when the card belongs in the national group below it.
   */
  function placeCard(card, location, selectedState) {
    if (!selectedState) {
      card.style.order = '';
      return false;
    }
    var isNational = location === 'National' && selectedState !== 'National';
    card.style.order = isNational ? '3' : '1';
    return isNational;
  }

  function filterCards() {
    var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var selectedState = stateFilter ? stateFilter.value : '';
    var selectedCity = cityFilter ? cityFilter.value : '';
    var visibleCount = 0;
    var localCount = 0;
    var nationalCount = 0;

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
      if (activeFacet && cardFacets(card).indexOf(activeFacet) === -1) {
        show = false;
      }

      card.style.display = show ? '' : 'none';

      if (show) {
        visibleCount++;
        if (placeCard(card, location, selectedState)) nationalCount++;
        else if (selectedState) localCount++;
      }
    });

    // Only worth a divider when a state is chosen and both sides have entries.
    nationalDivider.hidden = !(selectedState && nationalCount > 0 && localCount > 0);

    if (resultsCount) {
      if (!nationalDivider.hidden) {
        resultsCount.textContent =
          localCount + ' in ' + selectedState + ', plus ' + nationalCount + ' national';
      } else {
        resultsCount.textContent =
          visibleCount + ' resource' + (visibleCount !== 1 ? 's' : '') + ' shown';
      }
    }
  }

  // URL param support, e.g. ?state=Virginia&city=northern%20virginia&type=mobility
  var params = new URLSearchParams(window.location.search);
  if (params.get('state') && stateFilter) stateFilter.value = params.get('state');
  populateTypeFilter();
  populateCityFilter();
  if (params.get('city') && cityFilter) cityFilter.value = params.get('city').toLowerCase();

  // Deep-link a Type filter (e.g. the Adaptive Equipment icon cards link here
  // with ?type=mobility). Add the option if the facet didn't make the dropdown.
  if (params.get('type') && typeFilter) {
    var typeParam = params.get('type').toLowerCase();
    var hasOpt = Array.prototype.some.call(typeFilter.options, function(o) { return o.value === typeParam; });
    if (!hasOpt) {
      var opt = document.createElement('option');
      opt.value = typeParam;
      opt.textContent = facetLabel(typeParam);
      typeFilter.appendChild(opt);
    }
    typeFilter.value = typeParam;
    activeFacet = typeParam;
    if (typeFilterWrap) typeFilterWrap.hidden = false;
  }

  if (searchInput) searchInput.addEventListener('input', filterCards);
  if (stateFilter) stateFilter.addEventListener('change', function() {
    populateCityFilter();
    filterCards();
  });
  if (cityFilter) cityFilter.addEventListener('change', filterCards);

  filterCards();
});
