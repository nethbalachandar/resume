// ===== Utilities =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ===== Mobile nav toggle =====
const toggleBtn = $('.mobile-menu-toggle');
const navLinksWrap = $('#site-nav');

if (toggleBtn && navLinksWrap) {
  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!expanded));
    navLinksWrap.classList.toggle('active');
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars', expanded);
      icon.classList.toggle('fa-times', !expanded);
    }
  });

  // Close on link click (mobile)
  $$('.nav-link', navLinksWrap).forEach(link => {
    link.addEventListener('click', () => {
      navLinksWrap.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const icon = toggleBtn.querySelector('i');
      if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-times'); }
    });
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!navLinksWrap.contains(e.target) && !toggleBtn.contains(e.target)) {
      navLinksWrap.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const icon = toggleBtn.querySelector('i');
      if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-times'); }
    }
  });
}

// ===== Smooth scroll with header offset =====
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const headerH = $('.header').offsetHeight || 70;
        const y = target.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });
});

// ===== Active nav link via IntersectionObserver =====
const sections = $$('section[id]');
const navLinks = $$('.nav-link');

if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

  sections.forEach(sec => obs.observe(sec));
}

// ===== Header blur intensity on scroll (subtle) =====
window.addEventListener('scroll', () => {
  const header = $('.header');
  if (!header) return;
  const y = window.scrollY;
  header.style.background = y > 80
    ? 'rgba(255,255,255,0.92)'
    : 'rgba(255,255,255,0.85)';
});

// ===== Reveal animations =====
const revealEls = $$('[data-animate]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-inview'));
}

// ===== Stats counter =====
function animateStat(el) {
  const target = Number(el.getAttribute('data-target') || '0');
  const suffix = el.textContent.trim().endsWith('%') ? '%' : '';
  let current = 0;
  const steps = 50, step = Math.max(target / steps, 1);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = `${Math.floor(current)}${suffix}`;
  }, 30);
}
const statNumbers = $$('.stat-number');
if (statNumbers.length) {
  const so = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateStat(e.target);
        so.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  statNumbers.forEach(s => so.observe(s));
}

// ===== Newsletter fake submission =====
const form = $('.newsletter-form');
const statusP = $('.form-status');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const email = form.querySelector('input[type="email"]');
    if (!email || !btn) return;
    const original = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
      statusP && (statusP.textContent = 'Thanks! You’ll hear from me soon.');
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
        email.value = '';
        statusP && (statusP.textContent = '');
      }, 2000);
    }, 1200);
  });
}

// ===== Footer year =====
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Lightbox for gallery =====
const dialog = $('.lightbox');
const dialogImg = dialog?.querySelector('img');
const dialogCap = dialog?.querySelector('.lightbox__caption');
const dialogClose = dialog?.querySelector('.lightbox__close');

$$('.gallery-item img').forEach(img => {
  img.addEventListener('click', () => {
    if (!dialog) return;
    const full = img.getAttribute('data-full') || img.src;
    const cap = img.closest('figure')?.querySelector('figcaption')?.textContent || '';
    dialogImg.src = full;
    dialogImg.alt = img.alt || '';
    dialogCap.textContent = cap;
    dialog.showModal();
  });
});

dialogClose?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (e) => {
  // click outside image closes
  const rect = dialogImg.getBoundingClientRect();
  const withinImage = e.clientX >= rect.left && e.clientX <= rect.right &&
                      e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (!withinImage) dialog.close();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dialog?.open) dialog.close();
});
