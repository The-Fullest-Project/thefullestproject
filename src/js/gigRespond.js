document.addEventListener('DOMContentLoaded', function() {
  var urlParams = new URLSearchParams(window.location.search);
  var gigId = urlParams.get('gig');
  var gigInfo = document.getElementById('gig-info');
  var respondForm = document.getElementById('respond-form');
  var notFound = document.getElementById('gig-not-found');

  if (!gigId || !gigInfo) {
    if (notFound) notFound.style.display = '';
    if (gigInfo) gigInfo.style.display = 'none';
    return;
  }

  // Parse gig data from embedded JSON
  var gigDataEl = document.getElementById('gig-data');
  var gigs = [];
  try {
    gigs = JSON.parse(gigDataEl.textContent);
  } catch (e) {
    // Failed to parse gig data
  }

  var gig = gigs.find(function(g) { return g.id === gigId; });

  if (!gig || gig.status !== 'open') {
    if (notFound) notFound.style.display = '';
    if (gigInfo) gigInfo.style.display = 'none';
    return;
  }

  // Populate the page
  gigInfo.innerHTML = '<p class="text-lg mb-2">Responding to:</p>' +
    '<h2 class="text-2xl font-bold" style="color: var(--color-primary);">' +
    gig.title.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
    '</h2>' +
    '<p class="text-sm mt-2">Posted by ' +
    gig.posterFirstName.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
    '</p>';

  // Set hidden fields
  document.getElementById('respond-gig-id').value = gig.id;
  document.getElementById('respond-gig-title').value = gig.title;
  document.getElementById('respond-poster-email').value = gig.posterEmail;

  // Show form
  if (respondForm) respondForm.style.display = '';
});
