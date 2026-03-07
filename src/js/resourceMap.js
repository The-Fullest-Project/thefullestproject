/**
 * Resource Map View
 * Toggles between list and map view on the resources page.
 * Uses Leaflet.js with OpenStreetMap tiles (free, no API key).
 */
document.addEventListener('DOMContentLoaded', function() {
  var mapContainer = document.getElementById('resource-map');
  var resourceGrid = document.getElementById('resource-grid');
  var listViewBtn = document.getElementById('list-view-btn');
  var mapViewBtn = document.getElementById('map-view-btn');

  if (!mapContainer || !resourceGrid || !listViewBtn || !mapViewBtn) return;

  // Known city coordinates (lat, lng)
  var cityCoords = {
    // Northern Virginia
    'mclean': [38.9339, -77.1773],
    'vienna': [38.9012, -77.2653],
    'vienna (tysons)': [38.9187, -77.2311],
    'fairfax': [38.8462, -77.3064],
    'fairfax county': [38.8462, -77.3064],
    'burke': [38.7934, -77.2717],
    'centreville': [38.8404, -77.4289],
    'falls church': [38.8826, -77.1712],
    'chantilly': [38.8943, -77.4311],
    'warrenton': [38.7135, -77.7953],
    'loudoun county': [39.0764, -77.6379],
    'arlington': [38.8816, -77.0910],
    'alexandria': [38.8048, -77.0469],
    'manassas': [38.7509, -77.4753],
    'sterling': [39.0062, -77.4286],
    'reston': [38.9586, -77.3570],
    'herndon': [38.9696, -77.3861],
    'leesburg': [39.1157, -77.5636],
    'woodbridge': [38.6582, -77.2497],
    'springfield': [38.7893, -77.1872],
    'annandale': [38.8304, -77.1961],
    'ashburn': [39.0437, -77.4875],
    'purcellville': [39.1368, -77.7147],
    'oakton': [38.8810, -77.3010],
    'tysons': [38.9187, -77.2311],
    'north potomac': [39.0879, -77.2339],
    'great falls': [39.0001, -77.2884],
    'lynchburg': [37.4138, -79.1422],
    'northern virginia': [38.8816, -77.1712],
    // DC / Maryland
    'washington, dc': [38.9072, -77.0369],
    'dc metro area': [38.9072, -77.0369],
    'baltimore, md': [39.2904, -76.6122],
    'annapolis, md': [38.9784, -76.4922],
    // Portland
    'portland': [45.5152, -122.6784],
    'beaverton': [45.4871, -122.8037],
    'gresham': [45.5001, -122.4302],
    'hillsboro': [45.5229, -122.9898],
    'lake oswego': [45.4207, -122.6706],
    'tigard': [45.4312, -122.7715],
    'milwaukie': [45.4429, -122.6387],
    'clackamas': [45.4076, -122.5704],
  };

  // State/region-level coordinates (center of state)
  var locationCoords = {
    'Northern Virginia': [38.8816, -77.1712],
    'Portland': [45.5152, -122.6784],
    'National': [39.8283, -98.5795],
    'Alabama': [32.3182, -86.9023],
    'Alaska': [64.2008, -152.4937],
    'Arizona': [34.0489, -111.0937],
    'Arkansas': [34.7465, -92.2896],
    'California': [36.7783, -119.4179],
    'Colorado': [39.5501, -105.7821],
    'Connecticut': [41.6032, -73.0877],
    'Delaware': [38.9108, -75.5277],
    'District of Columbia': [38.9072, -77.0369],
    'Florida': [27.6648, -81.5158],
    'Georgia': [32.1656, -83.5085],
    'Hawaii': [19.8968, -155.5828],
    'Idaho': [44.0682, -114.742],
    'Illinois': [40.6331, -89.3985],
    'Indiana': [40.2672, -86.1349],
    'Iowa': [41.878, -93.0977],
    'Kansas': [39.0119, -98.4842],
    'Kentucky': [37.8393, -84.27],
    'Louisiana': [30.9843, -91.9623],
    'Maine': [45.2538, -69.4455],
    'Maryland': [39.0458, -76.6413],
    'Massachusetts': [42.4072, -71.3824],
    'Michigan': [44.3148, -85.6024],
    'Minnesota': [46.7296, -94.6859],
    'Mississippi': [32.3547, -89.3985],
    'Missouri': [37.9643, -91.8318],
    'Montana': [46.8797, -110.3626],
    'Nebraska': [41.4925, -99.9018],
    'Nevada': [38.8026, -116.4194],
    'New Hampshire': [43.1939, -71.5724],
    'New Jersey': [40.0583, -74.4057],
    'New Mexico': [34.5199, -105.8701],
    'New York': [40.7128, -74.006],
    'North Carolina': [35.7596, -79.0193],
    'North Dakota': [47.5515, -101.002],
    'Ohio': [40.4173, -82.9071],
    'Oklahoma': [35.4676, -97.5164],
    'Oregon': [43.8041, -120.5542],
    'Pennsylvania': [41.2033, -77.1945],
    'Rhode Island': [41.5801, -71.4774],
    'South Carolina': [33.8361, -81.1637],
    'South Dakota': [43.9695, -99.9018],
    'Tennessee': [35.5175, -86.5804],
    'Texas': [31.9686, -99.9018],
    'Utah': [39.321, -111.0937],
    'Vermont': [44.5588, -72.5778],
    'Virginia': [37.4316, -78.6569],
    'Washington': [47.7511, -120.7401],
    'West Virginia': [38.5976, -80.4549],
    'Wisconsin': [43.7844, -88.7879],
    'Wyoming': [43.075, -107.2903]
  };

  var map = null;
  var markers = [];
  var noDataMsg = null;

  function initMap() {
    if (map) return;
    map = L.map('resource-map').setView([39, -95], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(map);
  }

  function showMapView() {
    initMap();

    // Clear existing markers and message
    markers.forEach(function(m) { map.removeLayer(m); });
    markers = [];
    if (noDataMsg) { noDataMsg.remove(); noDataMsg = null; }

    var cards = resourceGrid.querySelectorAll('.resource-card');
    var bounds = [];

    cards.forEach(function(card) {
      if (card.style.display === 'none') return;

      var area = (card.dataset.area || '').toLowerCase();
      var location = card.dataset.location || '';
      var name = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
      var desc = card.querySelector('p') ? card.querySelector('p').textContent : '';
      var link = card.querySelector('a[href^="http"]');
      var website = link ? link.getAttribute('href') : '';

      // Find coordinates: try city first, then location/state level
      var coords = cityCoords[area];
      if (!coords) coords = locationCoords[location];
      if (!coords) return;

      // Add slight random offset to prevent overlapping markers
      var lat = coords[0] + (Math.random() - 0.5) * 0.008;
      var lng = coords[1] + (Math.random() - 0.5) * 0.008;

      var popup = '<strong>' + name + '</strong>';
      if (area) popup += '<br><em>' + area.replace(/\b\w/g, function(c) { return c.toUpperCase(); }) + '</em>';
      popup += '<br><span style="font-size:12px;">' + desc.substring(0, 100) + (desc.length > 100 ? '...' : '') + '</span>';
      if (website) popup += '<br><a href="' + website + '" target="_blank">Visit Website</a>';

      var marker = L.marker([lat, lng]).addTo(map).bindPopup(popup);
      markers.push(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      // Show message when no markers can be placed
      noDataMsg = document.createElement('div');
      noDataMsg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;background:white;padding:16px 24px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);text-align:center;font-size:14px;color:#555;';
      noDataMsg.textContent = 'No map pins available for these resources. Try the list view.';
      mapContainer.style.position = 'relative';
      mapContainer.appendChild(noDataMsg);
      map.setView([39, -95], 4);
    }

    resourceGrid.style.display = 'none';
    mapContainer.style.display = 'block';
    mapViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');

    // Refresh map size after display change
    setTimeout(function() { map.invalidateSize(); }, 100);
  }

  function isMapActive() {
    return mapContainer.style.display !== 'none';
  }

  function refreshMapMarkers() {
    if (!isMapActive()) return;
    // Clear existing markers and message
    markers.forEach(function(m) { map.removeLayer(m); });
    markers = [];
    if (noDataMsg) { noDataMsg.remove(); noDataMsg = null; }

    var cards = resourceGrid.querySelectorAll('.resource-card');
    var bounds = [];

    cards.forEach(function(card) {
      if (card.style.display === 'none') return;

      var area = (card.dataset.area || '').toLowerCase();
      var location = card.dataset.location || '';
      var name = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
      var desc = card.querySelector('p') ? card.querySelector('p').textContent : '';
      var link = card.querySelector('a[href^="http"]');
      var website = link ? link.getAttribute('href') : '';

      var coords = cityCoords[area];
      if (!coords) coords = locationCoords[location];
      if (!coords) return;

      var lat = coords[0] + (Math.random() - 0.5) * 0.008;
      var lng = coords[1] + (Math.random() - 0.5) * 0.008;

      var popup = '<strong>' + name + '</strong>';
      if (area) popup += '<br><em>' + area.replace(/\b\w/g, function(c) { return c.toUpperCase(); }) + '</em>';
      popup += '<br><span style="font-size:12px;">' + desc.substring(0, 100) + (desc.length > 100 ? '...' : '') + '</span>';
      if (website) popup += '<br><a href="' + website + '" target="_blank">Visit Website</a>';

      var marker = L.marker([lat, lng]).addTo(map).bindPopup(popup);
      markers.push(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      noDataMsg = document.createElement('div');
      noDataMsg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;background:white;padding:16px 24px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);text-align:center;font-size:14px;color:#555;';
      noDataMsg.textContent = 'No map pins available for these resources. Try the list view.';
      mapContainer.style.position = 'relative';
      mapContainer.appendChild(noDataMsg);
      map.setView([39, -95], 4);
    }
  }

  function showListView() {
    resourceGrid.style.display = '';
    mapContainer.style.display = 'none';
    listViewBtn.classList.add('active');
    mapViewBtn.classList.remove('active');
  }

  mapViewBtn.addEventListener('click', showMapView);
  listViewBtn.addEventListener('click', showListView);

  // Re-render map markers when filters change
  var searchInput = document.getElementById('search-input');
  var locationFilter = document.getElementById('location-filter');
  var areaFilter = document.getElementById('area-filter');
  var categoryFilter = document.getElementById('category-filter');

  // Use a small delay so filterResources() finishes hiding/showing cards first
  function onFilterChange() {
    setTimeout(refreshMapMarkers, 50);
  }

  if (searchInput) searchInput.addEventListener('input', onFilterChange);
  if (locationFilter) locationFilter.addEventListener('change', onFilterChange);
  if (areaFilter) areaFilter.addEventListener('change', onFilterChange);
  if (categoryFilter) categoryFilter.addEventListener('change', onFilterChange);

  // Start in list view
  showListView();
});
