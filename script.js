// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ===== Mobile nav =====
const toggleBtn = $('.mobile-menu-toggle');
const navLinksWrap = $('#site-nav');
if (toggleBtn && navLinksWrap) {
  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!expanded));
    navLinksWrap.classList.toggle('active');
    const icon = toggleBtn.querySelector('i');
    if (icon) { icon.classList.toggle('fa-bars', expanded); icon.classList.toggle('fa-times', !expanded); }
  });
  $$('.nav-link', navLinksWrap).forEach(link => {
    link.addEventListener('click', () => {
      navLinksWrap.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const icon = toggleBtn.querySelector('i');
      if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-times'); }
    });
  });
  document.addEventListener('click', (e) => {
    if (!navLinksWrap.contains(e.target) && !toggleBtn.contains(e.target)) {
      navLinksWrap.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const icon = toggleBtn.querySelector('i');
      if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-times'); }
    }
  });
}

// ===== Smooth scroll =====
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

// ===== Active link on scroll =====
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

// ===== Header subtle background change =====
window.addEventListener('scroll', () => {
  const header = $('.header');
  if (!header) return;
  header.style.background = window.scrollY > 80 ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.85)';
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
      if (e.isIntersecting) { animateStat(e.target); so.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  statNumbers.forEach(s => so.observe(s));
}

// ===== Newsletter fake submit =====
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

// ===== Lightbox for gallery images =====
const lightbox = $('.lightbox');
const lbImg = lightbox?.querySelector('img');
const lbCap = lightbox?.querySelector('.lightbox__caption');
const lbClose = lightbox?.querySelector('.lightbox__close');

$$('.gallery-item img').forEach(img => {
  img.addEventListener('click', () => {
    if (!lightbox) return;
    const full = img.getAttribute('data-full') || img.src;
    const cap = img.closest('figure')?.querySelector('figcaption')?.textContent || '';
    lbImg.src = full;
    lbImg.alt = img.alt || '';
    lbCap.textContent = cap;
    lightbox.showModal();
  });
});
lbClose?.addEventListener('click', () => lightbox?.close());
lightbox?.addEventListener('click', (e) => {
  const rect = lbImg.getBoundingClientRect();
  const within = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (!within) lightbox.close();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox?.open) lightbox.close(); });

// ===== Projects: auto tags + filter + details modal =====
(function projectsInit(){
  const root = $('#projects-root');
  const cards = $$('.project-card', root);
  const tagBar = $('#proj-tags');
  const searchEl = $('#proj-search');
  if (!root || !cards.length) return;

  // Build tag chips from data-tags on each card
  const set = new Set();
  cards.forEach(c => (c.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => set.add(t)));
  const allTags = ['All', ...[...set].sort((a,b)=>a.localeCompare(b))];

  let activeTag = 'All';
  let query = '';

  function renderChips(){
    if (!tagBar) return;
    tagBar.innerHTML = allTags.map(t => `
      <button role="tab" aria-selected="${t===activeTag}" class="chip ${t===activeTag?'active':''}" data-tag="${t}">${t}</button>
    `).join('');
    $$('.chip', tagBar).forEach(btn => {
      btn.addEventListener('click', () => {
        activeTag = btn.dataset.tag;
        renderChips();
        applyFilters();
      });
    });
  }

  // Fill visible tag badges on each card from its data-tags
  cards.forEach(c => {
    const holder = $('.project-tags', c);
    if (!holder) return;
    const tags = (c.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    holder.innerHTML = tags.map(t => `<span class="tag">${t}</span>`).join('');
  });

  function matches(card){
    const tags = (card.dataset.tags || '').split(',').map(t => t.trim());
    const text = card.textContent.toLowerCase() + ' ' + tags.join(' ').toLowerCase();
    const tagOK = (activeTag === 'All') || tags.includes(activeTag);
    const qOK = !query || text.includes(query.toLowerCase());
    return tagOK && qOK;
  }

  function applyFilters(){
    let visible = 0;
    cards.forEach(card => {
      const show = matches(card);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (!visible) {
      root.insertAdjacentHTML('beforeend', `<p class="section-subtitle" id="no-match">No projects match your filters.</p>`);
    } else {
      $('#no-match')?.remove();
    }
  }

  searchEl?.addEventListener('input', (e) => { query = e.target.value; applyFilters(); });
  renderChips(); applyFilters();

  // Project details modal: pulls HTML from .project-details
  const dlg = $('.project-modal');
  const dlgTitle = $('#project-modal-title');
  const dlgBody = $('.project-modal__content');
  const dlgClose = $('.project-modal__close');

  function openModal(cardId){
    const card = document.getElementById(cardId);
    if (!card || !dlg) return;
    const title = card.querySelector('.project-header h3')?.textContent || 'Project';
    const details = card.querySelector('.project-details');
    dlgTitle.textContent = title;
    dlgBody.innerHTML = details ? details.innerHTML : '<p>No additional details yet.</p>';
    dlg.showModal();

    // Lightbox inside modal (for any gallery images within details)
    $$('.gallery-item img', dlg).forEach(img => {
      img.addEventListener('click', () => {
        const full = img.getAttribute('data-full') || img.src;
        const cap = img.closest('figure')?.querySelector('figcaption')?.textContent || '';
        lbImg.src = full; lbImg.alt = img.alt || ''; lbCap.textContent = cap; lightbox.showModal();
      }, { once:true });
    });
  }

  $$('.project-open', root).forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.target));
  });

  dlgClose?.addEventListener('click', () => dlg?.close());
  dlg?.addEventListener('click', (e) => {
    const body = $('.project-modal__body', dlg);
    if (body && !body.contains(e.target)) dlg.close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dlg?.open) dlg.close();
  });
})();
