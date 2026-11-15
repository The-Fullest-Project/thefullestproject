/**
 * AI-assisted resource search on /resources/ (DECISIONS.md, 9 November 2026).
 *
 * 1. The visitor describes their situation.
 * 2. A Cloudflare Turnstile bot check runs (invisible unless it needs a click).
 * 3. The tfp-admin-api worker turns the text into filters: up to three real
 *    category slugs, a few search words, a state, and a city or county. The
 *    AI writes nothing the visitor reads.
 * 4. This script shows listings from /search-index.json:
 *      "Best matches" — listings whose name, tags or description contain the
 *        search words, from any category ("safety beds" finds the six
 *        listings tagged safety-bed);
 *      then one card per category, best matches first, in-state before
 *        national, with a link to the full category page.
 *
 * If AI isn't available (daily limit, budget, bot check, error), the same
 * matching runs on the visitor's own words instead, with category names,
 * state names and a few well-known places picked out of the text.
 *
 * Crisis wording shows 911 and 988 whatever the AI says: the worker's flag and
 * a local phrase list both trigger it, so it works even when AI is off.
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
  var BEST_MATCHES = 8;

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

  // Places in the two pilot areas, for the keyword fallback (the AI works
  // these out itself). A state named in the text wins over these.
  var PLACES = {
    'portland': 'Oregon', 'beaverton': 'Oregon', 'hillsboro': 'Oregon', 'gresham': 'Oregon',
    'multnomah': 'Oregon', 'eugene': 'Oregon', 'salem': 'Oregon', 'lake oswego': 'Oregon',
    'fairfax': 'Virginia', 'arlington': 'Virginia', 'alexandria': 'Virginia', 'loudoun': 'Virginia',
    'prince william': 'Virginia', 'northern virginia': 'Virginia', 'nova': 'Virginia',
    'reston': 'Virginia', 'herndon': 'Virginia', 'leesburg': 'Virginia', 'manassas': 'Virginia',
    'falls church': 'Virginia', 'vienna': 'Virginia', 'mclean': 'Virginia', 'richmond': 'Virginia'
  };

  // Only unmistakable phrases here: words like "emergency" or "abuse" also
  // appear in ordinary searches ("emergency respite", "substance abuse
  // program"), and the AI judges those in context.
  var CRISIS = /\b(suicid\w*|kill(ing)? (my|him|her|them)sel\w*|end (my|his|her|their) (own )?life|self[- ]?harm\w*|hurt(ing)? (my|him|her|them)sel\w*|overdos\w*|want(s)? to die|not safe at home|in danger|being (abused|hurt)|can'?t breathe)\b/i;

  // Everyday words that would match half the directory, so the keyword
  // fallback never searches on them.
  var STOP = ['give', 'list', 'need', 'needs', 'help', 'helps', 'looking', 'find', 'want', 'please',
    'some', 'with', 'that', 'this', 'have', 'from', 'what', 'where', 'about', 'there', 'their',
    'they', 'them', 'your', 'year', 'years', 'old', 'son', 'daughter', 'child', 'children', 'kid',
    'kids', 'baby', 'toddler', 'teen', 'teenage', 'teenager', 'adult', 'family', 'families',
    'friendly', 'special', 'near', 'around', 'area', 'local', 'resources', 'resource', 'services',
    'service', 'support', 'program', 'programs', 'options', 'good', 'best', 'free', 'cheap',
    'disability', 'disabilities', 'disabled', 'autism', 'autistic', 'care', 'know', 'does', 'anyone'];

  // ── Search index ──────────────────────────────────────────────────────────
  var indexPromise = null;
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch('/search-index.json').then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (rows) {
        rows.forEach(function (r) {
          r._name = (r.n || '').toLowerCase();
          r._tags = (r.k || '').toLowerCase().replace(/-/g, ' ');
          r._desc = (r.d || '').toLowerCase();
        });
        return rows;
      });
      indexPromise.catch(function () { indexPromise = null; });
    }
    return indexPromise;
  }

  // ── Turnstile ─────────────────────────────────────────────────────────────
  var turnstileLoad = null;
  var widgetId = null;
  var waiting = null;

  function botError(code) {
    var err = new Error('Bot check: ' + code);
    err.botCode = String(code);
    return err;
  }

  function loadTurnstile() {
    if (!turnstileLoad) {
      turnstileLoad = new Promise(function (resolve, reject) {
        window.tfpTurnstileReady = resolve;
        var s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=tfpTurnstileReady';
        s.async = true;
        s.onerror = function () { turnstileLoad = null; reject(botError('script-load')); };
        document.head.appendChild(s);
      });
    }
    return turnstileLoad;
  }

  function getToken() {
    if (!SITEKEY) return Promise.reject(botError('no-sitekey'));
    return loadTurnstile().then(function () {
      return new Promise(function (resolve, reject) {
        waiting = { resolve: resolve, reject: reject };
        var timer = setTimeout(function () {
          if (waiting) { waiting.reject(botError('timeout')); waiting = null; }
        }, 30000);
        function settle(fn, value) {
          clearTimeout(timer);
          if (waiting) { waiting[fn](value); waiting = null; }
        }
        try {
          if (widgetId === null) {
            widgetId = window.turnstile.render(turnstileBox, {
              sitekey: SITEKEY,
              execution: 'execute',
              appearance: 'interaction-only',
              callback: function (token) { settle('resolve', token); },
              // Cloudflare passes an error code, e.g. 110200 = this site's
              // address isn't on the widget's list of hostnames.
              'error-callback': function (code) { settle('reject', botError(code || 'error')); return true; },
              'expired-callback': function () { window.turnstile.reset(widgetId); }
            });
          } else {
            window.turnstile.reset(widgetId);
          }
          window.turnstile.execute(widgetId);
        } catch (e) {
          settle('reject', botError('render'));
        }
      });
    });
  }

  // ── Worker ────────────────────────────────────────────────────────────────
  function askWorker(q, token, botCode) {
    var body = { q: q, token: token || '' };
    if (botCode) body.botError = botCode;
    return fetch(WORKER + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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

  // ── Matching ──────────────────────────────────────────────────────────────
  function stem(word) { return word.toLowerCase().replace(/(ies|es|s)$/, ''); }

  /** How well a listing matches the search words: name 3, tags 2, description 1 per word. */
  function score(row, terms) {
    var total = 0;
    terms.forEach(function (t) {
      if (row._name.indexOf(t) !== -1) total += 3;
      else if (row._tags.indexOf(t) !== -1) total += 2;
      else if (row._desc.indexOf(t) !== -1) total += 1;
    });
    return total;
  }

  /** Search words for the keyword fallback, from the visitor's own text. */
  function fallbackTerms(q) {
    return q.toLowerCase().split(/[^a-z0-9]+/)
      .filter(function (w) { return w.length >= 4 && STOP.indexOf(w) === -1; })
      .map(stem)
      .filter(function (w, i, all) { return w.length >= 3 && all.indexOf(w) === i; });
  }

  function findPlace(q) {
    var text = ' ' + q.toLowerCase().replace(/[^a-z ]+/g, ' ') + ' ';
    var state = null;
    STATES.forEach(function (s) {
      if (!state && text.indexOf(' ' + s.toLowerCase() + ' ') !== -1) state = s;
    });
    var place = '';
    Object.keys(PLACES).forEach(function (p) {
      if (!place && text.indexOf(' ' + p + ' ') !== -1) {
        place = p.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        if (!state) state = PLACES[p];
      }
    });
    return { state: state, place: place };
  }

  function keywordFilters(q) {
    var where = findPlace(q);
    var terms = fallbackTerms(q);
    var cats = [];
    CATEGORIES.forEach(function (c) {
      var labelWords = (c.label + ' ' + c.value).toLowerCase().split(/[^a-z0-9]+/)
        .filter(function (w) { return w.length >= 4 && STOP.indexOf(w) === -1; })
        .map(stem);
      var hit = labelWords.some(function (w) {
        return terms.some(function (t) { return t.indexOf(w) === 0 || w.indexOf(t) === 0; });
      });
      if (hit && cats.length < 3) cats.push(c.value);
    });
    return { categories: cats, keywords: terms, state: where.state, place: where.place };
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

  /** In the visitor's state first, then national, then (with no state given) everywhere else. */
  function locationRank(row, state) {
    if (state && row.l === state) return 0;
    if (row.l === 'National') return 1;
    return 2;
  }

  function sortRows(rows, state, place) {
    var placeLower = (place || '').toLowerCase();
    return rows.sort(function (a, b) {
      return (b._score - a._score) ||
        (locationRank(a, state) - locationRank(b, state)) ||
        ((placeLower && (a.a || '').toLowerCase().indexOf(placeLower) !== -1 ? 0 : 1) -
         (placeLower && (b.a || '').toLowerCase().indexOf(placeLower) !== -1 ? 0 : 1)) ||
        a.n.localeCompare(b.n);
    });
  }

  /** Rows the visitor can use: their state and national, or everything when no state is known. */
  function inReach(row, state) {
    return !state || row.l === state || row.l === 'National';
  }

  function listingRow(row) {
    var li = el('li', 'px-3 py-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t');
    li.style.borderColor = 'var(--color-warm)';
    var left = el('div', 'min-w-0');
    var name = el('p', 'font-semibold text-sm', row.n);
    name.style.color = 'var(--color-text)';
    left.appendChild(name);
    var bits = [placeLabel(row), row.cl].filter(Boolean).join(' · ');
    if (bits) {
      var sub = el('p', 'text-xs', bits);
      sub.style.color = 'var(--color-text-light)';
      left.appendChild(sub);
    }
    li.appendChild(left);
    var actions = el('div', 'flex items-center gap-3 shrink-0');
    if (row.w) {
      var site = el('a', 'text-xs font-semibold no-underline', 'Website');
      site.href = row.w;
      site.target = '_blank';
      site.rel = 'noopener noreferrer';
      site.style.color = 'var(--color-secondary)';
      actions.appendChild(site);
    }
    var browse = el('a', 'text-xs font-semibold no-underline', 'Browse');
    browse.href = row.u;
    browse.style.color = 'var(--color-primary)';
    actions.appendChild(browse);
    li.appendChild(actions);
    return li;
  }

  function card(title, countText, rows, footerLink) {
    var c = el('li', 'card p-4');
    var head = el('h2', 'text-base font-bold mb-1', title);
    head.style.color = 'var(--color-primary)';
    c.appendChild(head);
    if (countText) {
      var count = el('p', 'text-xs mb-2', countText);
      count.style.color = 'var(--color-text-light)';
      c.appendChild(count);
    }
    if (rows.length) {
      var ul = el('ul', 'list-none p-0 m-0 flex flex-col');
      rows.forEach(function (row) { ul.appendChild(listingRow(row)); });
      c.appendChild(ul);
    }
    if (footerLink) c.appendChild(footerLink);
    return c;
  }

  function categoryCard(index, slug, state, place) {
    var label = LABELS[slug] || slug;
    var inCat = index.filter(function (r) { return (r.t || [r.c]).indexOf(slug) !== -1; });
    var local = state ? inCat.filter(function (r) { return r.l === state; }) : [];
    var national = inCat.filter(function (r) { return r.l === 'National'; });
    var usable = sortRows(inCat.filter(function (r) { return inReach(r, state); }), state, place);
    var shown = usable.slice(0, PER_CATEGORY);

    var countBits = [];
    if (state) countBits.push(local.length + ' in ' + state);
    countBits.push(national.length + ' national');
    if (!state && inCat.length > national.length) countBits.push((inCat.length - national.length) + ' in states');

    var more = el('a', 'inline-block text-sm font-semibold no-underline mt-3',
      'See all ' + label + (state ? ' in ' + state : '') + ' →');
    more.href = '/resources/' + slug + '/' + (state ? '?state=' + encodeURIComponent(state) : '');
    more.style.color = 'var(--color-primary)';

    var node = card(label, countBits.join(' · '), shown, more);
    if (!shown.length) {
      node.insertBefore(note(state
        ? 'No ' + label.toLowerCase() + ' listings in ' + state + ' or nationally yet.'
        : 'No listings in this category yet.'), more);
    }
    return { node: node, found: shown.length };
  }

  function summaryText(f, bestCount) {
    var labels = f.categories.map(function (c) { return LABELS[c] || c; });
    var text = labels.length ? 'Showing ' + labels.join(', ')
      : (bestCount ? 'Showing the best matches' : 'Showing results');
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

    return loadIndex().then(function (index) {
      var terms = (filters.keywords || []).filter(Boolean);
      index.forEach(function (r) { r._score = terms.length ? score(r, terms) : 0; });

      // A strong match is a name or tag hit, or several description hits.
      var best = sortRows(index.filter(function (r) {
        return r._score >= 2 && inReach(r, filters.state);
      }), filters.state, filters.place).slice(0, BEST_MATCHES);

      if (!best.length && !filters.categories.length) {
        if (opts.mode === 'ai') {
          results.appendChild(note('We couldn\'t match that to the directory. Try saying a little more about what you need, or browse the categories below.'));
          addClear();
          if (categoriesGrid) categoriesGrid.hidden = false;
          return 0;
        }
        if (showNameSearch(q)) {
          results.appendChild(note('Showing listings whose names match your words.'));
          addClear();
          return 1;
        }
      }

      var summary = el('p', 'text-sm font-semibold mb-3', summaryText(filters, best.length));
      summary.style.color = 'var(--color-text)';
      summary.tabIndex = -1;
      summary.id = 'ai-search-summary';
      results.appendChild(summary);
      if (!filters.state) {
        results.appendChild(note('Tell us your state or city to see what\'s near you first.'));
      }

      var list = el('ul', 'grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 m-0');
      var found = 0;
      if (best.length) {
        var bestCard = card('Best matches', 'Listings that mention what you asked about', best);
        bestCard.classList.add('md:col-span-2');
        bestCard.id = 'ai-search-best';
        list.appendChild(bestCard);
        found += best.length;
      }
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
    return Promise.resolve(render(q, keywordFilters(q), { mode: 'fallback', notice: notice, crisis: crisis }));
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
      .catch(function (err) {
        // Tell the worker why the bot check failed, so it shows in the counts.
        var code = (err && err.botCode) || 'unknown';
        return askWorker(q, '', code).catch(function () { return { mode: 'fallback', reason: 'botcheck' }; });
      })
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
        var filters = {
          categories: data.categories || [],
          keywords: data.keywords || [],
          state: data.state || null,
          place: data.place || ''
        };
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
