/**
 * Directory search on /resources/.
 *
 * Searches every listing by name and area. The index (/search-index.json) is
 * fetched on first interaction rather than on page load, so the hub stays fast
 * for the many visitors who just click a category.
 *
 * Index row shape, kept short on purpose:
 *   n name · a area · l location (state or "National") · c top category slug
 *   u category page url · w website
 */
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('directory-search');
  var results = document.getElementById('directory-search-results');
  var list = document.getElementById('directory-search-list');
  var count = document.getElementById('directory-search-count');
  var categories = document.getElementById('directory-categories');

  if (!input || !results || !list || !count) return;

  var MAX_RESULTS = 40;
  var index = null;
  var loading = false;
  var pending = null;

  function loadIndex() {
    if (index || loading) return;
    loading = true;
    fetch('/search-index.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        index = data;
        loading = false;
        if (pending !== null) {
          var term = pending;
          pending = null;
          render(term);
        }
      })
      .catch(function () {
        loading = false;
        count.textContent = 'Search is unavailable right now — browse by category below.';
        results.hidden = false;
      });
  }

  function matches(row, term) {
    return (row.n || '').toLowerCase().indexOf(term) !== -1 ||
           (row.a || '').toLowerCase().indexOf(term) !== -1 ||
           (row.l || '').toLowerCase().indexOf(term) !== -1;
  }

  // A listing whose name starts with the term is a better hit than one that
  // merely contains it, so "arc" surfaces "Arc of Northern Virginia" first.
  function rank(row, term) {
    return (row.n || '').toLowerCase().indexOf(term) === 0 ? 0 : 1;
  }

  function placeLabel(row) {
    if (row.a && row.l) return row.a + ', ' + row.l;
    return row.a || row.l || '';
  }

  function render(term) {
    if (!index) {
      pending = term;
      loadIndex();
      return;
    }

    var hits = index.filter(function (row) { return matches(row, term); });
    hits.sort(function (a, b) {
      var byRank = rank(a, term) - rank(b, term);
      return byRank !== 0 ? byRank : (a.n || '').localeCompare(b.n || '');
    });

    while (list.firstChild) list.removeChild(list.firstChild);

    if (!hits.length) {
      count.textContent = 'No resources match “' + term + '”. Try a shorter word, or browse by category below.';
      results.hidden = false;
      return;
    }

    var shown = hits.slice(0, MAX_RESULTS);
    count.textContent = hits.length === 1
      ? '1 resource found'
      : hits.length + ' resources found' + (hits.length > MAX_RESULTS ? ' — showing the first ' + MAX_RESULTS : '');

    shown.forEach(function (row) {
      var li = document.createElement('li');
      li.className = 'card px-4 py-3 flex flex-wrap items-center justify-between gap-2';

      var left = document.createElement('div');
      var name = document.createElement('p');
      name.className = 'font-semibold text-sm';
      name.style.color = 'var(--color-text)';
      name.textContent = row.n;
      left.appendChild(name);

      var place = placeLabel(row);
      if (place) {
        var sub = document.createElement('p');
        sub.className = 'text-xs';
        sub.style.color = 'var(--color-text-light)';
        sub.textContent = place;
        left.appendChild(sub);
      }
      li.appendChild(left);

      var actions = document.createElement('div');
      actions.className = 'flex items-center gap-3 shrink-0';

      if (row.w) {
        var site = document.createElement('a');
        site.href = row.w;
        site.target = '_blank';
        site.rel = 'noopener noreferrer';
        site.className = 'text-xs font-semibold no-underline';
        site.style.color = 'var(--color-secondary)';
        site.textContent = 'Website';
        actions.appendChild(site);
      }

      var browse = document.createElement('a');
      browse.href = row.u;
      browse.className = 'text-xs font-semibold no-underline';
      browse.style.color = 'var(--color-primary)';
      browse.textContent = 'Browse category';
      actions.appendChild(browse);

      li.appendChild(actions);
      list.appendChild(li);
    });

    results.hidden = false;
  }

  function onInput() {
    var term = input.value.trim().toLowerCase();

    if (term.length < 2) {
      results.hidden = true;
      while (list.firstChild) list.removeChild(list.firstChild);
      if (categories) categories.hidden = false;
      return;
    }

    // Hide the category grid while searching so results aren't buried under it.
    if (categories) categories.hidden = true;
    render(term);
  }

  var debounce;
  input.addEventListener('input', function () {
    clearTimeout(debounce);
    debounce = setTimeout(onInput, 120);
  });

  // Warm the index as soon as someone focuses the box, so the first keystroke
  // usually has data waiting.
  input.addEventListener('focus', loadIndex, { once: true });

  // Deep link: /resources/?q=arc
  var q = new URLSearchParams(window.location.search).get('q');
  if (q) {
    input.value = q;
    onInput();
  }
});
