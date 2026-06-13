// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function() {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });
  }
});

// Newsletter forms: submit through the admin worker (Brevo double-opt-in),
// falling back to a native Formspree POST if the worker is unreachable
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('form[data-newsletter]').forEach(function(form) {
    const workerUrl = form.getAttribute('data-worker-url');
    if (!workerUrl || workerUrl.indexOf('http') !== 0) return;

    form.addEventListener('submit', function handler(e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      fetch(workerUrl, { method: 'POST', body: new FormData(form) })
        .then(function(res) {
          if (!res.ok) throw new Error('worker error');
          return res.json();
        })
        .then(function(data) {
          const msg = document.createElement('p');
          msg.className = 'text-sm font-semibold';
          msg.setAttribute('role', 'status');
          msg.textContent = data.message || 'Almost there — check your inbox for a confirmation email.';
          form.replaceWith(msg);
        })
        .catch(function() {
          form.removeEventListener('submit', handler);
          form.submit();
        });
    });
  });
});
