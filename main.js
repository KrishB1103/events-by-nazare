/* ============================================================
   Events by Nazare — main.js
   ============================================================ */

/* ── 1. STICKY NAV SHADOW ── */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 30
    ? '0 4px 30px rgba(42,36,48,0.10)'
    : 'none';
});

/* ── 2. SMOOTH SCROLL for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── 3. PORTFOLIO FILTER ── */
const categoryMap = ['wedding', 'corporate', 'birthday', 'sports', 'shower', 'shower'];
document.querySelectorAll('.portfolio-item').forEach((item, i) => {
  item.dataset.category = categoryMap[i] || 'other';
});

document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    const selected = this.textContent.trim().toLowerCase();

    document.querySelectorAll('.portfolio-item').forEach(item => {
      const cat = item.dataset.category;
      const show =
        selected === 'all' ||
        (selected === 'weddings'  && cat === 'wedding')   ||
        (selected === 'corporate' && cat === 'corporate') ||
        (selected === 'birthdays' && cat === 'birthday')  ||
        (selected === 'showers'   && cat === 'shower')    ||
        (selected === 'sports'    && cat === 'sports');

      if (show) {
        item.style.display = '';
        item.style.opacity = '0';
        item.style.transform = 'scale(0.96)';
        requestAnimationFrame(() => {
          item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        });
      } else {
        item.style.transition = 'opacity 0.3s ease';
        item.style.opacity = '0';
        setTimeout(() => { item.style.display = 'none'; }, 300);
      }
    });
  });
});

/* ── 4. SCROLL FADE-IN via IntersectionObserver ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.service-card, .testi-card, .portfolio-item, .about-visual, .about-content, .contact-info, .contact-form'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
  revealObserver.observe(el);
});

/* ── 5. CONTACT FORM VALIDATION & SUBMISSION via Formspree ── */
const FORMSPREE_URL = 'https://formspree.io/f/mnjgpjkp';

const form      = document.querySelector('.contact-form');
const submitBtn = form.querySelector('.btn-submit');

form.addEventListener('submit', async e => {
  e.preventDefault();
  let valid = true;

  // Clear previous errors
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    el.style.borderColor = 'var(--lavender)';
  });

  // Validation rules
  const rules = [
    { selector: 'input[data-field="firstname"]', msg: 'First name is required.' },
    { selector: 'input[type="tel"]',           msg: 'A valid number is required.' },
    { selector: 'select',                        msg: 'Please select an event type.' },
  ];

  rules.forEach(({ selector, msg }) => {
    const field = form.querySelector(selector);
    if (!field) return;
    const isEmpty    = !field.value.trim();
    const isEmailBad = field.type === 'tel' && field.value &&
                       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);

    if (isEmpty || isEmailBad) {
      valid = false;
      field.style.borderColor = '#e07070';
      const err = document.createElement('span');
      err.className = 'field-error';
      err.style.cssText = 'color:#e07070;font-size:0.65rem;letter-spacing:0.05em;margin-top:0.25rem;display:block;';
      err.textContent = msg;
      field.closest('.form-group').appendChild(err);
    }
  });

  if (!valid) return;

  // Show sending state
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });

    if (response.ok) {
      // Success — show thank you message
      form.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;">
          <div style="font-size:2.5rem;margin-bottom:1rem;">✦</div>
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:300;color:var(--charcoal);margin-bottom:0.8rem;">
            Thank You!
          </h3>
          <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.8;font-weight:300;">
            We've received your inquiry and will be in touch within 24 hours.<br/>
            We can't wait to help you create something beautiful.
          </p>
        </div>`;
    } else {
      // Formspree returned an error
      const data = await response.json();
      const errorMsg = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
      throw new Error(errorMsg);
    }

  } catch (err) {
    // Network or server error — show inline message, re-enable form
    submitBtn.textContent = 'Send Inquiry →';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';

    const errBanner = document.createElement('div');
    errBanner.style.cssText = 'color:#e07070;font-size:0.75rem;padding:0.8rem 1rem;border:1px solid #e07070;margin-top:0.5rem;';
    errBanner.textContent = '⚠ ' + err.message;
    form.appendChild(errBanner);
    setTimeout(() => errBanner.remove(), 5000);
  }
});

/* ── 6. MOBILE HAMBURGER MENU ── */
const navLinks = document.querySelector('.nav-links');
const burger   = document.getElementById('burger-btn');

burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  burger.innerHTML = navLinks.classList.contains('open') ? '&#10005;' : '&#9776;';
});

// Close menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.innerHTML = '&#9776;';
  });
});
