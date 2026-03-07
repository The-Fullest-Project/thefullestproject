# Motion Reference

## Contents
- Animation Approach
- Card Hover Interaction
- Button Transitions
- Form Focus States
- Mobile Menu Toggle
- Navigation Interactions
- WARNING: Motion Anti-Patterns
- Adding New Animations

## Animation Approach

The Fullest Project uses **CSS transitions only** — no animation libraries. All motion is subtle, functional, and tied to user interaction (hover, focus, state change). There are no page transitions, scroll-triggered animations, or entrance effects.

This is intentional. The audience is caregivers seeking practical information. Motion serves to confirm interactivity, not to entertain.

## Card Hover Interaction

The signature micro-interaction — a gentle lift on hover:

```css
/* src/css/styles.css */
.card {
  transition: box-shadow 0.2s, transform 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}
```

- **Duration:** 0.2s — fast enough to feel responsive, slow enough to be perceptible
- **Properties:** Shadow deepens (elevation cue) + slight upward translate
- **Easing:** Default (ease) — no custom curve needed for this subtlety

This applies to ALL `.card` elements automatically. No additional classes needed.

## Button Transitions

Both button classes transition `background-color` on hover:

```css
.btn-primary {
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: var(--color-primary-dark); /* #1E4D39 */
}

.btn-secondary {
  transition: background-color 0.2s;
}
.btn-secondary:hover {
  background-color: #D4801F; /* Darker amber */
}
```

The ghost button variant uses Tailwind's built-in transition:

```njk
<a class="bg-white/20 hover:bg-white/30 transition-colors ...">Learn More</a>
```

## Form Focus States

### Global Focus Ring

```css
*:focus-visible {
  outline: 3px solid var(--color-accent); /* Blue #5B8DB8 */
  outline-offset: 2px;
}
```

This provides a visible, accessible focus indicator on every interactive element. The `focus-visible` selector only triggers on keyboard navigation, not mouse clicks.

### Form Input Focus

`.form-input` overrides the global focus ring with a custom border treatment:

```css
.form-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(43, 107, 79, 0.1);
}
```

The teal border + soft glow provides a warmer, more branded feel than the blue accent ring.

### Filter Select Focus

```css
.filter-select:focus {
  border-color: var(--color-primary);
  outline: none;
}
```

Simpler than `.form-input` — just a border color change without the glow. Appropriate for the smaller, inline filter controls.

## Mobile Menu Toggle

The mobile menu uses a binary show/hide via `classList.toggle('hidden')`:

```js
// src/js/main.js
menuBtn.addEventListener('click', function() {
  const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', !isExpanded);
  mobileMenu.classList.toggle('hidden');
});
```

There is no slide or fade animation. The menu appears/disappears instantly. If adding a transition:

```css
/* Suggested enhancement pattern */
#mobile-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}
#mobile-menu.open {
  max-height: 500px; /* Sufficient for menu content */
}
```

Replace `hidden` class toggling with `open` class toggling in JS. See the **javascript** skill for event handling patterns.

## Navigation Interactions

Desktop nav links use simple underline on hover:

```njk
<a href="/" class="no-underline hover:underline" style="color: var(--color-text);">Home</a>
```

Footer links use opacity:

```njk
<a href="/resources/" class="hover:opacity-100 no-underline" style="color: white;">Resource Directory</a>
```

Both patterns are CSS-only, no JavaScript. The opacity pattern works because footer links start at `opacity-80` (parent `<ul>` has `opacity-80` class).

## WARNING: Motion Anti-Patterns

### Animating Layout Properties

**The Problem:**

```css
/* BAD — triggers layout recalculation */
.card:hover {
  margin-top: -2px;
  height: calc(100% + 2px);
}
```

**Why This Breaks:**
1. `margin` and `height` trigger reflow — expensive for the browser
2. Shifts surrounding elements, causing visual jitter in grid layouts
3. Can cause scroll jumps on mobile

**The Fix:**

```css
/* GOOD — transform is GPU-accelerated, doesn't affect layout */
.card:hover {
  transform: translateY(-2px);
}
```

### Adding Decorative Animations

**The Problem:**

```css
/* BAD — bouncing icons, spinning loaders, pulsing elements */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.card-icon { animation: bounce 2s infinite; }
```

**Why This Breaks:** The target audience is caregivers under stress. Continuous motion is distracting and can trigger vestibular disorders. The `prefers-reduced-motion` media query should ALWAYS be respected.

**The Fix:**

```css
/* GOOD — Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
```

### Inconsistent Transition Durations

Every transition in the codebase uses `0.2s`. NEVER introduce `0.3s`, `0.5s`, or other values without a specific reason. Consistent timing creates a cohesive feel.

## Adding New Animations

When adding motion to new components, follow this checklist:

- [ ] Uses `transition` (not `animation`) for interactive states
- [ ] Duration is `0.2s` (matching existing pattern)
- [ ] Only animates `transform`, `opacity`, `box-shadow`, `border-color`, or `background-color`
- [ ] Respects `prefers-reduced-motion`
- [ ] Serves a functional purpose (feedback, state change) not decoration
