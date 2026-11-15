/**
 * AI-assisted resource search on /resources/ (DECISIONS.md, 9 November 2026).
 *
 * 1. The visitor describes their situation.
 * 2. A Cloudflare Turnstile bot check runs (invisible unless it needs a click).
 * 3. The tfp-admin-api worker turns the text into filters: up to three real
 *    category slugs, a state, and a city or county. The AI writes nothing the
 *    visitor reads.
 * 4. This script shows matching listings from /search-index.json, in-state
 *    first, then national, with a link to each full category page.
 *
 * If the worker says AI isn't available (daily limit, budget, bot check,
 * error), a simple keyword search runs instead: category names and state
 * names found in the text, or failing that, listing names.
 *
 * Crisis wording shows 911 and 988 whatever the AI says: the worker's flag and
 * a local word list both trigger it, so it works even when AI is off.
 *
 * Nothing typed is stored or put in the address bar. The homepage box hands
 * its text over in sessionStorage ("tfp-ai-search") and links to #ask.
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('ai-search');
  if (!form || !document.getElementById('ai-search-results')) return;

  var input = document.getElementById('ai-search-input');
  var button = document.getElementById('ai-search-btn');
  var turnstileBox = document.getElementById('ai-search-turnstile');
  var results = document.getElementById('ai-search-results');
  var categoriesGrid = document.getElementById('directory-categories');
  var keywordResults = document.getElementById('directory-search-results');
  var nameInput = document.getElementById('directory-search');

  var WORKER = form.getAttribute('data-worker');
  var SITEKEY = form.getAttribute('data-sitekey');
  var PER_CATEGORY = 6;

  var CATEGORIES = [];
  try { CATEGORIES = JSON.parse(document.getElementById('ai-search-categories').textContent); } catch (e) {}
  var LABELS = {};
  CATEGORIES.forEach(function (c) { LABELS[c.value] = c.label; });

  var STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana',
    'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
    'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
    'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

  // Checked locally as well as by the AI, so the numbers show even when AI is off.
  // Only unmistakable phrases here: words like "emergency" or "abuse" also
  // appear in ordinary searches ("emergency respite", "substance abuse
  // program"), and the AI judges those in context.
  var CRISIS = /\b(suicid\w*|kill(ing)? (my|him|her|them)sel\w*|end (my|his|her|their) (own )?life|self[- ]?harm\w*|hurt(ing)? (my|him|her|them)sel\w*|overdos\w*|want(s)? to die|not safe at home|in danger|being (abused|hurt)|can'?t breathe)\b/i;

  // ── Search index ──────────────────────────────────────────────────────────
  var indexPromise = null;
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch('/search-index.json').then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      });
      indexPromise.catch(function () { indexPromise = null; });
    }
    return indexPromise;
  }

  // ── Turnstile ─────────────────────────────────────────────────────────────
  var turnstileLoad = null;
  var widgetId = null;
  var waiting = null;

  function loadTurnstile() {
    if (!turnstileLoad) {
      turnstileLoad = new Promise(function (resolve, reject) {
        window.tfpTurnstileReady = resolve;
        var s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=tfpTurnstileReady';
        s.async = true;
        s.onerror = function () { turnstileLoad = null; reject(new Error('Bot check did not load')); };
        document.head.appendChild(s);
      });
    }
    return turnstileLoad;
  }

  function getToken() {
    if (!SITEKEY) return Promise.reject(new Error('No site key'));
    return loadTurnstile().then(function () {
      return new Promise(function (resolve, reject) {
        waiting = { resolve: resolve, reject: reject };
        var timer = setTimeout(function () {
          if (waiting) { waiting.reject(new Error('Bot check timed out')); waiting = null; }
        }, 30000);
        function settle(fn, value) {
          clearTimeout(timer);
          if (waiting) { waiting[fn](value); waiting = null; }
        }
        if (widgetId === null) {
          widgetId = window.turnstile.render(turnstileBox, {
            sitekey: SITEKEY,
            execution: 'execute',
            appearance: 'interaction-only',
            callback: function (token) { settle('resolve', token); },
            'error-callback': function () { settle('reject', new Error('Bot check failed')); },
            'expired-callback': function () { window.turnstile.reset(widgetId); }
          });
        } else {
          window.turnstile.reset(widgetId);
        }
        window.turnstile.execute(widgetId);
      });
    });
  }

  // ── Worker ────────────────────────────────────────────────────────────────
  function askWorker(q, token) {
    return fetch(WORKER + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: q, token: token })
    }).then(function (res) {
      if (res.status === 400) {
        return res.json().then(function (d) { return { mode: 'invalid', message: d.error }; });
      }
      if (!res.ok) return { mode: 'fallback', reason: 'error' };
      return res.json();
    });
  }

  function reportOutcome(found) {
    try {
      fetch(WORKER + '/search/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ found: Boolean(found) }),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  // ── Keyword fallback ──────────────────────────────────────────────────────
  function stem(word) { return word.toLowerCase().replace(/(ies|es|s)$/, ''); }

  function keywordFilters(q) {
    var text = ' ' + q.toLowerCase() + ' ';
    var state = null;
    STATES.forEach(function (s) {
      if (!state && text.indexOf(' ' + s.toLowerCase()) !== -1) state = s;
    });
    var words = q.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 4; }).map(stem);
    var cats = [];
    CATEGORIES.forEach(function (c) {
      var labelWords = (c.label + ' ' + c.value).toLowerCase().split(/[^a-z0-9]+/)
        .filter(function (w) { return w.length >= 4 && ['care', 'services', 'support', 'resources', 'adaptive'].indexOf(w) === -1; })
        .map(stem);
      var hit = labelWords.some(function (w) { return words.indexOf(w) !== -1; });
      if (hit && cats.length < 3) cats.push(c.value);
    });
    return { categories: cats, state: state, place: '' };
  }

  // ── Rendering ─────────────────────────────────────────────────────────────
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function clearResults() {
    while (results.firstChild) results.removeChild(results.firstChild);
  }

  function crisisBanner() {
    var box = el('div', 'card p-4 mb-4');
    box.setAttribute('role', 'alert');
    box.style.borderLeft = '6px solid var(--color-secondary)';
    var h = el('p', 'font-bold mb-1', 'If you or someone else is in danger, call 911.');
    h.style.color = 'var(--color-text)';
    box.appendChild(h);
    var p = el('p', 'text-sm');
    p.appendChild(document.createTextNode('For a mental health or suicide crisis, call or text '));
    var a = el('a', 'font-bold', '988');
    a.href = 'tel:988';
    p.appendChild(a);
    p.appendChild(document.createTextNode(' (the 988 Suicide & Crisis Lifeline), any time, day or night. '));
    var e = el('a', 'font-bold', 'Call 911');
    e.href = 'tel:911';
    p.appendChild(e);
    box.appendChild(p);
    return box;
  }

  function note(text) {
    var p = el('p', 'text-sm mb-3', text);
    p.style.color = 'var(--color-text-light)';
    return p;
  }

  function placeLabel(row) {
    if (row.a && row.l) return row.a + ', ' + row.l;
    return row.a || row.l || '';
  }

  function rowsFor(index, slug, state, place) {
    var inCat = index.filter(function (r) { return (r.t || [r.c]).indexOf(slug) !== -1; });
    var local = state ? inCat.filter(function (r) { return r.l === state; }) : [];
    var national = inCat.filter(function (r) { return r.l === 'National'; });
    var placeLower = (place || '').toLowerCase();
    if (placeLower) {
      local.sort(function (a, b) {
        var am = (a.a || '').toLowerCase().indexOf(placeLower) !== -1 ? 0 : 1;
        var bm = (b.a || '').toLowerCase().indexOf(placeLower) !== -1 ? 0 : 1;
        return am - bm || a.n.localeCompare(b.n);
      });
    } else {
      local.sort(function (a, b) { return a.n.localeCompare(b.n); });
    }
    national.sort(function (a, b) { return a.n.localeCompare(b.n); });
    // Without a state, show national listings only: a list of other states'
    // providers isn't useful to someone who hasn't said where they are.
    return { local: local, national: national, all: inCat.length };
  }

  function listingRow(row) {
    var li = el('li', 'px-3 py-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t');
    li.style.borderColor = 'var(--color-warm)';
    var left = el('div', 'min-w-0');
    var name = el('p', 'font-semibold text-sm', row.n);
    name.style.color = 'var(--color-text)';
    left.appendChild(name);
    var where = placeLabel(row);
    if (where) {
      var sub = el('p', 'text-xs', where);
      sub.style.color = 'var(--color-text-light)';
      left.appendChild(sub);
    }
    li.appendChild(left);
    if (row.w) {
      var site = el('a', 'text-xs font-semibold no-underline shrink-0', 'Website');
      site.href = row.w;
      site.target = '_blank';
      site.rel = 'noopener noreferrer';
      site.style.color = 'var(--color-secondary)';
      li.appendChild(site);
    }
    return li;
  }

  function categoryCard(index, slug, state, place) {
    var label = LABELS[slug] || slug;
    var r = rowsFor(index, slug, state, place);
    var shown = r.local.concat(r.national).slice(0, PER_CATEGORY);

    var card = el('li', 'card p-4');
    var head = el('h2', 'text-base font-bold mb-1', label);
    head.style.color = 'var(--color-primary)';
    card.appendChild(head);

    var countBits = [];
    if (state) countBits.push(r.local.length + ' in ' + state);
    countBits.push(r.national.length + ' national');
    var count = el('p', 'text-xs mb-2', countBits.join(' · '));
    count.style.color = 'var(--color-text-light)';
    card.appendChild(count);

    if (shown.length) {
      var ul = el('ul', 'list-none p-0 m-0 flex flex-col');
      shown.forEach(function (row) { ul.appendChild(listingRow(row)); });
      card.appendChild(ul);
    } else {
      card.appendChild(note(state
        ? 'No ' + label.toLowerCase() + ' listings in ' + state + ' yet.'
        : 'No national listings in this category yet.'));
    }

    var more = el('a', 'inline-block text-sm font-semibold no-underline mt-3',
      'See all ' + label + (state ? ' in ' + state : '') + ' →');
    more.href = '/resources/' + slug + '/' + (state ? '?state=' + encodeURIComponent(state) : '');
    more.style.color = 'var(--color-primary)';
    card.appendChild(more);

    return { node: card, found: shown.length };
  }

  function summaryText(f) {
    var labels = f.categories.map(function (c) { return LABELS[c] || c; });
    var text = labels.length ? 'Showing ' + labels.join(', ') : 'Showing results';
    if (f.state) text += ' in ' + f.state;
    if (f.place && (!f.state || f.place.toLowerCase() !== f.state.toLowerCase())) text += ', near ' + f.place;
    return text + '.';
  }

  function showNameSearch(q) {
    // Last resort: the existing name search below the box.
    if (!nameInput) return false;
    nameInput.value = q;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  function render(q, filters, opts) {
    clearResults();
    results.hidden = false;
    if (keywordResults) keywordResults.hidden = true;

    if (opts.crisis) results.appendChild(crisisBanner());
    if (opts.notice) results.appendChild(note(opts.notice));

    if (opts.offTopic) {
      results.appendChild(note('This search finds disability resources and support. Try describing what you, or the person you care for, needs: for example "respite care in Fairfax" or "help paying for a wheelchair".'));
      addClear();
      if (categoriesGrid) categoriesGrid.hidden = false;
      return 0;
    }

    if (!filters.categories.length) {
      if (opts.mode === 'ai') {
        results.appendChild(note('We couldn\'t match that to a directory category. Try saying a little more about what you need, or browse the categories below.'));
        addClear();
        if (categoriesGrid) categoriesGrid.hidden = false;
        return 0;
      }
      // Keyword fallback found no category words: try listing names instead.
      if (showNameSearch(q)) {
        results.appendChild(note('Showing listings whose names match your words.'));
        addClear();
        return 1;
      }
    }

    return loadIndex().then(function (index) {
      var summary = el('p', 'text-sm font-semibold mb-3', summaryText(filters));
      summary.style.color = 'var(--color-text)';
      summary.tabIndex = -1;
      summary.id = 'ai-search-summary';
      results.appendChild(summary);
      if (!filters.state) {
        results.appendChild(note('Tell us your state or city to see local listings as well as national ones.'));
      }

      var list = el('ul', 'grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 m-0');
      var found = 0;
      filters.categories.forEach(function (slug) {
        var c = categoryCard(index, slug, filters.state, filters.place);
        found += c.found;
        list.appendChild(c.node);
      });
      results.appendChild(list);
      addClear();
      if (categoriesGrid) categoriesGrid.hidden = true;
      summary.focus({ preventScroll: true });
      return found;
    }).catch(function () {
      results.appendChild(note('Search is unavailable right now. Browse by category below.'));
      if (categoriesGrid) categoriesGrid.hidden = false;
      return 0;
    });
  }

  function addClear() {
    var btn = el('button', 'text-sm font-semibold underline mt-4', 'Clear search and show all categories');
    btn.type = 'button';
    btn.style.color = 'var(--color-secondary)';
    btn.addEventListener('click', function () {
      clearResults();
      results.hidden = true;
      if (categoriesGrid) categoriesGrid.hidden = false;
      if (nameInput && nameInput.value) {
        nameInput.value = '';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      input.focus();
    });
    results.appendChild(btn);
  }

  var FALLBACK_NOTICES = {
    limit: 'You\'ve used today\'s AI searches, so this is a simple keyword search. AI search is available again tomorrow.',
    budget: 'AI search is resting for the rest of today, so this is a simple keyword search.',
    signin: 'AI search is for signed-in members, so this is a simple keyword search.'
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  var busy = false;

  function setBusy(on) {
    busy = on;
    button.disabled = on;
    button.textContent = on ? 'Searching…' : 'Find resources';
    results.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  function runFallback(q, reason, crisis) {
    var notice = FALLBACK_NOTICES[reason] || 'AI search isn\'t available right now, so this is a simple keyword search.';
    var f = keywordFilters(q);
    return Promise.resolve(render(q, f, { mode: 'fallback', notice: notice, crisis: crisis }));
  }

  function search(q) {
    q = q.replace(/\s+/g, ' ').trim();
    if (busy) return;
    if (q.length < 3) {
      clearResults();
      results.hidden = false;
      results.appendChild(note('Please describe what you\'re looking for in a few words.'));
      input.focus();
      return;
    }
    setBusy(true);
    var localCrisis = CRISIS.test(q);
    loadIndex(); // warm it while the bot check and AI run

    getToken()
      .then(function (token) { return askWorker(q, token); })
      .catch(function () { return { mode: 'fallback', reason: 'botcheck' }; })
      .then(function (data) {
        if (data.mode === 'invalid') {
          clearResults();
          results.hidden = false;
          results.appendChild(note(data.message || 'Please try describing that differently.'));
          return null;
        }
        if (data.mode !== 'ai') {
          return runFallback(q, data.reason, localCrisis || Boolean(data.crisis)).then(function () { return null; });
        }
        var filters = { categories: data.categories || [], state: data.state || null, place: data.place || '' };
        return Promise.resolve(render(q, filters, {
          mode: 'ai',
          crisis: localCrisis || Boolean(data.crisis),
          offTopic: Boolean(data.offTopic)
        })).then(function (found) { reportOutcome(found > 0); });
      })
      .catch(function () { return runFallback(q, 'error', localCrisis); })
      .then(function () { setBusy(false); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    search(input.value);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      search(input.value);
    }
  });
  // Load the bot check as soon as someone shows intent, so it's ready on submit.
  input.addEventListener('focus', function () { loadTurnstile().catch(function () {}); }, { once: true });

  // Hand-off from the homepage box.
  if (window.location.hash === '#ask') {
    var handed = null;
    try {
      handed = sessionStorage.getItem('tfp-ai-search');
      sessionStorage.removeItem('tfp-ai-search');
    } catch (e) {}
    try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
    if (handed) {
      input.value = handed;
      search(handed);
    } else {
      input.focus();
    }
  }
});
