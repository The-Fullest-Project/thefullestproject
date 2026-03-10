/**
 * Resource Map View
 * Toggles between card, list, and map view on the resources page.
 * Uses Leaflet.js with OpenStreetMap tiles (free, no API key).
 */
document.addEventListener('DOMContentLoaded', function() {
  var mapContainer = document.getElementById('resource-map');
  var resourceGrid = document.getElementById('resource-grid');
  var cardViewBtn = document.getElementById('card-view-btn');
  var listViewBtn = document.getElementById('list-view-btn');
  var mapViewBtn = document.getElementById('map-view-btn');

  if (!mapContainer || !resourceGrid || !cardViewBtn || !listViewBtn || !mapViewBtn) return;

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
    'lorton': [38.7043, -77.2278],
    'northern virginia': [38.8816, -77.1712],
    'clifton': [38.7804, -77.3867],
    // Central Virginia
    'richmond': [37.5407, -77.4360],
    'charlottesville': [38.0293, -78.4767],
    'fredericksburg': [38.3032, -77.4605],
    'henrico': [37.5432, -77.3959],
    'midlothian': [37.5021, -77.6483],
    // Hampton Roads
    'virginia beach': [36.8529, -75.9780],
    'norfolk': [36.8508, -76.2859],
    'hampton': [37.0299, -76.3452],
    'newport news': [37.0871, -76.4730],
    'chesapeake': [36.7682, -76.2875],
    'hampton roads': [36.9000, -76.3000],
    // Southwest Virginia
    'roanoke': [37.2710, -79.9414],
    'blacksburg': [37.2296, -80.4139],
    'staunton': [38.1496, -79.0717],
    'harrisonburg': [38.4496, -78.8689],
    'danville': [36.5860, -79.3950],
    'winchester': [39.1857, -78.1633],
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
  var currentView = 'cards'; // 'cards', 'list', or 'map'

  function initMap() {
    if (map) return;
    map = L.map('resource-map').setView([39, -95], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(map);
  }

  function clearActiveButtons() {
    cardViewBtn.classList.remove('active');
    listViewBtn.classList.remove('active');
    mapViewBtn.classList.remove('active');
  }

  function showCardView() {
    currentView = 'cards';
    resourceGrid.style.display = '';
    resourceGrid.classList.remove('list-view');
    mapContainer.style.display = 'none';
    clearActiveButtons();
    cardViewBtn.classList.add('active');
  }

  function showListView() {
    currentView = 'list';
    resourceGrid.style.display = '';
    resourceGrid.classList.add('list-view');
    mapContainer.style.display = 'none';
    clearActiveButtons();
    listViewBtn.classList.add('active');
  }

  function showMapView() {
    currentView = 'map';
    initMap();
    refreshMapMarkers();
    resourceGrid.style.display = 'none';
    resourceGrid.classList.remove('list-view');
    mapContainer.style.display = 'block';
    clearActiveButtons();
    mapViewBtn.classList.add('active');
    setTimeout(function() { map.invalidateSize(); }, 100);
  }

  function refreshMapMarkers() {
    if (currentView !== 'map' || !map) return;
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
      noDataMsg.textContent = 'No map pins available for these resources. Try the card view.';
      mapContainer.style.position = 'relative';
      mapContainer.appendChild(noDataMsg);
      map.setView([39, -95], 4);
    }
  }

  cardViewBtn.addEventListener('click', showCardView);
  listViewBtn.addEventListener('click', showListView);
  mapViewBtn.addEventListener('click', showMapView);

  // Re-render map markers when filters change
  var searchInput = document.getElementById('search-input');
  var locationFilter = document.getElementById('location-filter');
  var areaFilter = document.getElementById('area-filter');
  var categoryFilter = document.getElementById('category-filter');

  function onFilterChange() {
    setTimeout(refreshMapMarkers, 50);
  }

  if (searchInput) searchInput.addEventListener('input', onFilterChange);
  if (locationFilter) locationFilter.addEventListener('change', onFilterChange);
  if (areaFilter) areaFilter.addEventListener('change', onFilterChange);
  if (categoryFilter) categoryFilter.addEventListener('change', onFilterChange);

  // Start in card view
  showCardView();
});
