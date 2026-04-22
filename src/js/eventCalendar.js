/**
 * Event Calendar View
 * Renders a navigable month calendar with events placed on their dates.
 * Works alongside the existing list view with a toggle.
 */
document.addEventListener('DOMContentLoaded', function() {
  var calendarContainer = document.getElementById('event-calendar');
  var listContainer = document.getElementById('events-list');
  var listViewBtn = document.getElementById('event-list-view-btn');
  var calendarViewBtn = document.getElementById('event-calendar-view-btn');

  if (!calendarContainer || !listContainer) return;

  // Parse event data from rendered cards
  var eventCards = listContainer.querySelectorAll('.event-card');
  var events = [];
  eventCards.forEach(function(card) {
    events.push({
      name: card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '',
      venue: card.getAttribute('data-venue') || '',
      type: card.getAttribute('data-type') || '',
      location: card.getAttribute('data-location') || '',
      frequency: card.querySelector('.tag:nth-child(2)') ? card.querySelector('.tag:nth-child(2)').textContent.trim() : '',
      website: card.querySelector('a.btn-primary') ? card.querySelector('a.btn-primary').getAttribute('href') : '',
      element: card
    });
  });

  // Parse frequency strings into date rules
  var ORDINALS = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, 'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'last': -1 };
  var DAYS = { 'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6 };

  function parseRecurrence(freq) {
    if (!freq) return null;
    var lower = freq.toLowerCase();

    // Match "1st Tuesday of each month" or "3rd Thursday"
    for (var ordKey in ORDINALS) {
      for (var dayKey in DAYS) {
        if (lower.includes(ordKey) && lower.includes(dayKey)) {
          return { ordinal: ORDINALS[ordKey], dayOfWeek: DAYS[dayKey] };
        }
      }
    }
    return null;
  }

  function getNthDayOfMonth(year, month, dayOfWeek, ordinal) {
    if (ordinal === -1) {
      // Last occurrence
      var lastDay = new Date(year, month + 1, 0);
      var d = lastDay.getDate();
      while (new Date(year, month, d).getDay() !== dayOfWeek) d--;
      return new Date(year, month, d);
    }
    var count = 0;
    for (var day = 1; day <= 31; day++) {
      var date = new Date(year, month, day);
      if (date.getMonth() !== month) break;
      if (date.getDay() === dayOfWeek) {
        count++;
        if (count === ordinal) return date;
      }
    }
    return null;
  }

  // Compute events for a given month
  function getEventsForMonth(year, month) {
    var monthEvents = [];
    var recurringOnly = [];

    events.forEach(function(ev) {
      var rule = parseRecurrence(ev.frequency);
      if (rule) {
        var eventDate = getNthDayOfMonth(year, month, rule.dayOfWeek, rule.ordinal);
        if (eventDate) {
          monthEvents.push({ date: eventDate, event: ev });
        }
      } else if (ev.frequency) {
        recurringOnly.push(ev);
      }
    });

    monthEvents.sort(function(a, b) { return a.date - b.date; });
    return { dated: monthEvents, recurring: recurringOnly };
  }

  // Current calendar state
  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  var currentMonth = currentDate.getMonth();

  var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function renderCalendar() {
    var data = getEventsForMonth(currentYear, currentMonth);
    var firstDay = new Date(currentYear, currentMonth, 1).getDay();
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    var today = new Date();

    // Build event lookup by day number
    var eventsByDay = {};
    data.dated.forEach(function(item) {
      var d = item.date.getDate();
      if (!eventsByDay[d]) eventsByDay[d] = [];
      eventsByDay[d].push(item.event);
    });

    var html = '';

    // Navigation
    html += '<div class="flex items-center justify-between mb-6">';
    html += '<button id="cal-prev" class="btn-secondary text-sm no-underline px-3 py-1">&larr; Prev</button>';
    html += '<h2 class="text-xl font-bold" style="color: var(--color-primary);">' + MONTH_NAMES[currentMonth] + ' ' + currentYear + '</h2>';
    html += '<button id="cal-next" class="btn-secondary text-sm no-underline px-3 py-1">Next &rarr;</button>';
    html += '</div>';

    // Calendar grid
    html += '<div class="grid grid-cols-7 gap-px rounded-lg overflow-hidden border" style="border-color: var(--color-warm); background-color: var(--color-warm);">';

    // Day headers
    DAY_NAMES.forEach(function(day) {
      html += '<div class="text-center text-xs font-bold py-2" style="background-color: var(--color-primary); color: white;">' + day + '</div>';
    });

    // Empty cells before first day
    for (var i = 0; i < firstDay; i++) {
      html += '<div class="min-h-[80px] p-1" style="background-color: #f9f9f9;"></div>';
    }

    // Day cells
    for (var d = 1; d <= daysInMonth; d++) {
      var isToday = (d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear());
      var hasEvents = eventsByDay[d] && eventsByDay[d].length > 0;

      html += '<div class="min-h-[80px] p-1 relative" style="background-color: ' + (isToday ? 'var(--color-warm)' : 'white') + ';">';
      html += '<span class="text-xs font-semibold ' + (isToday ? 'text-white rounded-full px-1.5 py-0.5' : '') + '" style="' + (isToday ? 'background-color: var(--color-primary);' : 'color: var(--color-text-light);') + '">' + d + '</span>';

      if (hasEvents) {
        eventsByDay[d].forEach(function(ev) {
          var link = ev.website ? ' onclick="window.open(\'' + ev.website.replace(/'/g, "\\'") + '\', \'_blank\')"' : '';
          html += '<div class="mt-1 text-xs px-1 py-0.5 rounded truncate cursor-pointer" style="background-color: var(--color-primary); color: white; font-size: 0.65rem;"' + link + ' title="' + ev.name.replace(/"/g, '&quot;') + '">';
          html += ev.name.length > 20 ? ev.name.substring(0, 18) + '...' : ev.name;
          html += '</div>';
        });
      }

      html += '</div>';
    }

    // Fill remaining cells
    var totalCells = firstDay + daysInMonth;
    var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (var r = 0; r < remaining; r++) {
      html += '<div class="min-h-[80px] p-1" style="background-color: #f9f9f9;"></div>';
    }

    html += '</div>';

    // Dated events list below calendar
    if (data.dated.length > 0) {
      html += '<div class="mt-8"><h3 class="text-lg font-bold mb-4" style="color: var(--color-primary);">This Month\'s Events</h3>';
      html += '<div class="space-y-3">';
      data.dated.forEach(function(item) {
        var dateStr = MONTH_NAMES[currentMonth] + ' ' + item.date.getDate() + ', ' + currentYear;
        var dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][item.date.getDay()];
        html += '<div class="card p-4 flex items-center gap-4">';
        html += '<div class="flex-shrink-0 text-center w-16">';
        html += '<div class="text-2xl font-bold" style="color: var(--color-primary);">' + item.date.getDate() + '</div>';
        html += '<div class="text-xs" style="color: var(--color-text-light);">' + dayName + '</div>';
        html += '</div>';
        html += '<div class="flex-grow">';
        html += '<h4 class="font-semibold" style="color: var(--color-text);">' + item.event.name + '</h4>';
        html += '<p class="text-xs" style="color: var(--color-text-light);">' + item.event.frequency + '</p>';
        html += '</div>';
        if (item.event.website) {
          html += '<a href="' + item.event.website + '" target="_blank" rel="noopener noreferrer" class="btn-primary text-xs no-underline flex-shrink-0">Details</a>';
        }
        html += '</div>';
      });
      html += '</div></div>';
    }

    // Recurring events (no specific date parseable)
    if (data.recurring.length > 0) {
      html += '<div class="mt-8"><h3 class="text-lg font-bold mb-4" style="color: var(--color-primary);">Recurring Events</h3>';
      html += '<div class="space-y-3">';
      data.recurring.forEach(function(ev) {
        html += '<div class="card p-4 flex items-center gap-4">';
        html += '<div class="flex-shrink-0 w-16 text-center">';
        html += '<div class="text-lg" style="color: var(--color-accent);">&#x1F501;</div>';
        html += '</div>';
        html += '<div class="flex-grow">';
        html += '<h4 class="font-semibold" style="color: var(--color-text);">' + ev.name + '</h4>';
        html += '<p class="text-xs" style="color: var(--color-text-light);">' + ev.frequency + '</p>';
        html += '</div>';
        if (ev.website) {
          html += '<a href="' + ev.website + '" target="_blank" rel="noopener noreferrer" class="btn-primary text-xs no-underline flex-shrink-0">Details</a>';
        }
        html += '</div>';
      });
      html += '</div></div>';
    }

    if (data.dated.length === 0 && data.recurring.length === 0) {
      html += '<div class="mt-8 card p-8 text-center"><p style="color: var(--color-text-light);">No events found for this month.</p></div>';
    }

    calendarContainer.innerHTML = html;

    // Bind navigation
    document.getElementById('cal-prev').addEventListener('click', function() {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar();
    });
    document.getElementById('cal-next').addEventListener('click', function() {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar();
    });
  }

  // View toggle handlers
  if (listViewBtn && calendarViewBtn) {
    listViewBtn.addEventListener('click', function() {
      listContainer.classList.remove('hidden');
      calendarContainer.classList.add('hidden');
      listViewBtn.style.backgroundColor = 'var(--color-primary)';
      listViewBtn.style.color = 'white';
      calendarViewBtn.style.backgroundColor = 'white';
      calendarViewBtn.style.color = 'var(--color-primary)';
      // Show filter bar
      var filterBar = document.querySelector('.card.p-6.mb-8');
      if (filterBar) filterBar.classList.remove('hidden');
      var resultsCount = document.getElementById('event-results-count');
      if (resultsCount) resultsCount.classList.remove('hidden');
    });

    calendarViewBtn.addEventListener('click', function() {
      listContainer.classList.add('hidden');
      calendarContainer.classList.remove('hidden');
      calendarViewBtn.style.backgroundColor = 'var(--color-primary)';
      calendarViewBtn.style.color = 'white';
      listViewBtn.style.backgroundColor = 'white';
      listViewBtn.style.color = 'var(--color-primary)';
      // Hide list filters (calendar has its own nav)
      var filterBar = document.querySelector('.card.p-6.mb-8');
      if (filterBar) filterBar.classList.add('hidden');
      var resultsCount = document.getElementById('event-results-count');
      if (resultsCount) resultsCount.classList.add('hidden');
      renderCalendar();
    });
  }
});
