/* ─── LOADER ─── */
const loader = document.getElementById('loader');
const loaderPercent = document.getElementById('loader-percent');
let progress = 0;

const tick = setInterval(() => {
  progress += Math.floor(Math.random() * 12) + 3;
  if (progress >= 100) {
    progress = 100;
    clearInterval(tick);
    setTimeout(() => loader.classList.add('hidden'), 300);
  }
  loaderPercent.textContent = progress + '%';
}, 80);

/* ─── NAVBAR: scroll state & mobile menu ─── */
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.textContent = open ? '✕' : '☰';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.textContent = '☰';
  });
});

/* ─── TESTIMONIAL SLIDER ─── */
const track = document.getElementById('testimonialTrack');
const cards = track.querySelectorAll('.testimonial-card');
let current = 0;

function cardWidth() {
  return cards[0].offsetWidth + 24; // card width + gap
}

function slideTo(idx) {
  const max = cards.length - Math.floor(track.parentElement.offsetWidth / cardWidth());
  current = Math.max(0, Math.min(idx, max));
  track.style.transform = `translateX(-${current * cardWidth()}px)`;
}

document.getElementById('nextBtn').addEventListener('click', () => slideTo(current + 1));
document.getElementById('prevBtn').addEventListener('click', () => slideTo(current - 1));

// Auto-advance every 5 seconds
setInterval(() => {
  const max = cards.length - Math.floor(track.parentElement.offsetWidth / cardWidth());
  slideTo(current >= max ? 0 : current + 1);
}, 5000);

/* ─── SCROLL REVEAL ─── */
const revealEls = document.querySelectorAll('section, .work-item, .testimonial-card, .expertise-list li');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.visible').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
});

// Apply visible state
document.addEventListener('scroll', () => {}, { passive: true });

const applyVisible = (el) => {
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
};

new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) applyVisible(e.target); });
}, { threshold: 0.12 }).observe(document.body); // fallback — real work done above

// Fix: attach to each element properly
revealEls.forEach(el => {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      applyVisible(el);
    }
  }, { threshold: 0.12 }).observe(el);
});

/* ─── CONTACT FORM ─── */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sent ✓';
  btn.style.background = '#4caf50';
  btn.disabled = true;
  // TODO: replace with your real form submission (e.g. fetch to API)
});

/* ─── PLANS MODAL ─── */
const modal = document.getElementById('planModal');
const modalPlanName = document.getElementById('modalPlanName');
const modalPlanPrice = document.getElementById('modalPlanPrice');

function openModal(btn) {
  const card = btn.closest('.plan-card');
  modalPlanName.textContent = card.dataset.plan;
  modalPlanPrice.textContent = card.dataset.price + ' / project';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  // reset form
  document.getElementById('planForm').reset();
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on backdrop click
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── PASTE YOUR PAYSTACK LINKS HERE ──────────────────────────────
const PAYSTACK_LINKS = {
  'Starter Plan':        'https://paystack.com/buy/starter-plan-tnsdjj',
  'Starter 2 Plan':      'https://paystack.com/buy/starter-2-plan-btxade',
  'Pro Plan':            'https://paystack.com/buy/pro-plan-bmhkiy',
  'Pro 2 Plan':          'https://paystack.com/buy/pro-2-plan-ifskwj',
  'Enterprise Plan':     'https://paystack.com/buy/enterprise-plan',
  'Enterprise Pro Plan': 'https://paystack.com/buy/enterprise-max-plan',
};

// ── FORMSPREE ENDPOINT HERE ──────────────────────────
// 1. Go to formspree.io → New Form → copy the endpoint URL
// 2. Replace the string below with your endpoint e.g:
//    'https://formspree.io/f/abcdefgh'
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xwvngwlz';
// ────────────────────────────────────────────────────────────────

async function submitPlanForm(e) {
  e.preventDefault();

  const plan      = modalPlanName.textContent;
  const brandName = document.getElementById('brandName').value;
  const email     = document.getElementById('brandEmail').value;
  const industry  = document.getElementById('industry').value;
  const submitBtn = document.querySelector('.modal-submit');

  // Show loading state
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    // Send details to your inbox via Formspree
    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        plan,
        price: modalPlanPrice.textContent,
        brandName,
        email,
        industry,
      }),
    });
  } catch (err) {
    // Non-blocking — still redirect even if email fails
    console.warn('Formspree error:', err);
  }

  // Redirect to the correct Paystack checkout for the selected plan
  const paystackUrl = PAYSTACK_LINKS[plan];
  if (paystackUrl) {
    window.location.href = paystackUrl;
  } else {
    alert('Payment link not found for this plan. Please contact us directly.');
    submitBtn.textContent = 'Proceed to Payment →';
    submitBtn.disabled = false;
  }
}