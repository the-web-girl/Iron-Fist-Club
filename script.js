/* ============================================================
   IRON FIST BOXING CLUB – JAVASCRIPT
   Burger menu · FAQ · Scroll reveal · Form validation · Filters
   ============================================================ */

'use strict';

// ---- UTILS -------------------------------------------------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ---- BURGER MENU ------------------------------------------- 
(function initBurger() {
  const btn = $('#burgerBtn');
  const menu = $('#navMenu');
  if (!btn || !menu) return;

  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Fermer le menu');
    btn.classList.add('open');
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first link
    const firstLink = menu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Ouvrir le menu');
    btn.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close on link click
  $$('.nav__link, .nav__cta', menu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
      btn.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target) && menu.classList.contains('open')) {
      closeMenu();
    }
  });
})();

// ---- HEADER SCROLL EFFECT ----------------------------------
(function initHeaderScroll() {
  const header = $('.header');
  if (!header) return;

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
})();

// ---- SCROLL REVEAL -----------------------------------------
(function initScrollReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  if (!window.IntersectionObserver) {
    // Fallback for older browsers
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay based on position in group
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 400);
        
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

// ---- FAQ ACCORDION ----------------------------------------- 
(function initFAQ() {
  const items = $$('.faq__item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      items.forEach(other => {
        const otherBtn = other.querySelector('.faq__question');
        const otherAns = other.querySelector('.faq__answer');
        if (otherBtn && otherAns && other !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAns.hidden = true;
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();

// ---- SCHEDULE FILTERS ------------------------------------
(function initScheduleFilters() {
  const filterBtns = $$('.filter-btn');
  const slots = $$('.slot');
  const cells = $$('.schedule-table td:not(.time-cell)');
  if (!filterBtns.length || !slots.length) return;

  function applyFilter(filter) {
    if (filter === 'all') {
      slots.forEach(slot => slot.classList.remove('hidden'));
    } else {
      slots.forEach(slot => {
        const tags = (slot.dataset.tags || '').split(' ');
        slot.classList.toggle('hidden', !tags.includes(filter));
      });
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.dataset.filter || 'all');
    });
  });
})();

// ---- FORM VALIDATION ---------------------------------------
(function initForms() {

  // Validation rules
  const validators = {
    required: (val) => val.trim() !== '' ? null : 'Ce champ est obligatoire.',
    email: (val) => {
      if (!val.trim()) return 'Ce champ est obligatoire.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'Adresse email invalide.';
    },
    tel: (val) => {
      if (!val.trim()) return 'Ce champ est obligatoire.';
      return /^[\d\s\+\-\.()]{8,15}$/.test(val.replace(/\s/g, '')) ? null : 'Numéro de téléphone invalide.';
    },
    checkbox: (el) => el.checked ? null : 'Vous devez accepter pour continuer.'
  };

  function validateField(field) {
    const name = field.name;
    const type = field.type;
    const errorEl = field.parentElement.querySelector('.form-error');
    let error = null;

    if (type === 'checkbox') {
      if (field.required) error = validators.checkbox(field);
    } else if (type === 'email') {
      if (field.required) error = validators.email(field.value);
    } else if (type === 'tel') {
      if (field.required) error = validators.tel(field.value);
    } else {
      if (field.required) error = validators.required(field.value);
    }

    if (errorEl) {
      errorEl.textContent = error || '';
    }
    field.classList.toggle('error', !!error);
    field.setAttribute('aria-invalid', error ? 'true' : 'false');

    return !error;
  }

  function setupForm(form, successId) {
    if (!form) return;

    const successEl = document.getElementById(successId);

    // Live validation on blur
    $$('input, select, textarea', form).forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      const fields = $$('input[required], select[required], textarea[required]', form);
      let valid = true;

      fields.forEach(field => {
        if (!validateField(field)) valid = false;
      });

      if (valid) {
        // In production: send data via fetch/XHR
        form.style.display = 'none';
        if (successEl) {
          successEl.hidden = false;
          successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          successEl.focus();
        }
      } else {
        // Focus first error
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
      }
    });
  }

  setupForm(document.getElementById('essaiForm'), 'essaiSuccess');
  setupForm(document.getElementById('contactForm'), 'contactSuccess');
})();

// ---- SMOOTH SCROLL FOR ANCHOR LINKS ------------------------
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      const y = target.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();

// ---- ACTIVE NAV HIGHLIGHT (current page) -------------------
(function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else if (link.classList.contains('active') && href !== path) {
      // Only remove if it's not the correct page
      if (path !== '' || href !== 'index.html') {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    }
  });
})();

// ---- KEYBOARD NAVIGATION TRAP IN MOBILE MENU ---------------
(function initFocusTrap() {
  const menu = $('#navMenu');
  const btn = $('#navBtn') || $('#burgerBtn');
  if (!menu) return;

  menu.addEventListener('keydown', e => {
    if (!menu.classList.contains('open')) return;
    if (e.key !== 'Tab') return;

    const focusable = $$('a, button', menu).filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

// ---- REDUCED MOTION RESPECT --------------------------------
(function respectReducedMotion() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  function handleMotionPreference(e) {
    if (e.matches) {
      // Immediately show all reveal elements
      $$('.reveal').forEach(el => el.classList.add('visible'));
    }
  }
  
  handleMotionPreference(mediaQuery);
  mediaQuery.addEventListener('change', handleMotionPreference);
})();
