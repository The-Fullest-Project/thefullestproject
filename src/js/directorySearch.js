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

  /**
   * Group headings in the order they appear on the page, so search results sit
   * under the same headings in the same order as the category grid. Read from
   * the DOM rather than a second copy of the list: it cannot drift.
   */
  function groupOrder() {
    var headings = document.querySelectorAll('#directory-categories h2');
    return Array.prototype.map.call(headings, function (h) { return h.textContent.trim(); });
  }

  function resultRow(row) {
    var li = document.createElement('li');
    li.className = 'px-3 py-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t';
    li.style.borderColor = 'var(--color-warm)';

    var left = document.createElement('div');
    left.className = 'min-w-0';

    var name = document.createElement('p');
    name.className = 'font-semibold text-sm';
    name.style.color = 'var(--color-text)';
    name.textContent = row.n;
    left.appendChild(name);

    var bits = [placeLabel(row), row.cl].filter(Boolean).join(' · ');
    if (bits) {
      var sub = document.createElement('p');
      sub.className = 'text-xs';
      sub.style.color = 'var(--color-text-light)';
      sub.textContent = bits;
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
    browse.textContent = 'Browse';
    actions.appendChild(browse);

    li.appendChild(actions);
    return li;
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

    // Bucket by group, then emit in the page's own group order.
    var buckets = {};
    shown.forEach(function (row) {
      var g = row.g || 'Other';
      if (!buckets[g]) buckets[g] = [];
      buckets[g].push(row);
    });

    var order = groupOrder();
    Object.keys(buckets).forEach(function (g) {
      if (order.indexOf(g) === -1) order.push(g);
    });

    order.forEach(function (groupName) {
      var rows = buckets[groupName];
      if (!rows || !rows.length) return;

      var section = document.createElement('li');
      section.className = 'card p-4';

      var head = document.createElement('h2');
      head.className = 'text-base font-bold mb-1';
      head.style.color = 'var(--color-primary)';
      head.textContent = groupName;
      section.appendChild(head);

      var countLine = document.createElement('p');
      countLine.className = 'text-xs mb-2';
      countLine.style.color = 'var(--color-text-light)';
      countLine.textContent = rows.length + (rows.length === 1 ? ' match' : ' matches');
      section.appendChild(countLine);

      var inner = document.createElement('ul');
      inner.className = 'list-none p-0 m-0 flex flex-col';
      rows.forEach(function (row) { inner.appendChild(resultRow(row)); });
      section.appendChild(inner);

      list.appendChild(section);
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
