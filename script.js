// ================= HEADER SCROLL STATE =================
const header = document.getElementById('siteHeader');
const toTop = document.getElementById('toTop');

function onScroll(){
  if (!header) return;
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}
document.addEventListener('scroll', onScroll, { passive:true });
onScroll();

if (toTop){
  toTop.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });
}

// ================= MOBILE DRAWER =================
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('drawerOverlay');

function toggleDrawer(open){
  if (!drawer) return;
  const isOpen = open ?? !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  overlay.classList.toggle('open', isOpen);
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

if (hamburger){
  hamburger.addEventListener('click', () => toggleDrawer());
  overlay.addEventListener('click', () => toggleDrawer(false));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleDrawer(false)));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) toggleDrawer(false);
  });
}

// ================= SCROLL REVEAL =================
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ================= ANIMATED COUNTERS =================
const counters = document.querySelectorAll('.stat-num, .metric-num');

function animateCounter(el){
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold:0.5 });

counters.forEach(c => counterObserver.observe(c));

// ================= TESTIMONIAL SLIDER =================
const testiCards = document.querySelectorAll('.testi-card');
const testiDotsWrap = document.getElementById('testiDots');
let testiIndex = 0;
let testiTimer;

if (testiDotsWrap && testiCards.length){
  testiCards.forEach((_, i) => {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    dot.addEventListener('click', () => showTesti(i, true));
    testiDotsWrap.appendChild(dot);
  });
  var testiDots = testiDotsWrap.querySelectorAll('button');

  restartTestiTimer();
}

function showTesti(i, manual){
  testiCards[testiIndex].classList.remove('active');
  testiDots[testiIndex].classList.remove('active');
  testiIndex = i;
  testiCards[testiIndex].classList.add('active');
  testiDots[testiIndex].classList.add('active');
  if (manual) restartTestiTimer();
}

function restartTestiTimer(){
  clearInterval(testiTimer);
  testiTimer = setInterval(() => {
    showTesti((testiIndex + 1) % testiCards.length);
  }, 5000);
}

// ================= MARKET CHART BARS =================
const chartBars = document.querySelectorAll('.chart-bar');
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const bar = entry.target;
      // scale 0-20% growth to a 0-100% track width for visual contrast
      const value = parseFloat(bar.dataset.value);
      bar.style.width = Math.min((value / 20) * 100, 100) + '%';
      chartObserver.unobserve(bar);
    }
  });
}, { threshold: 0.4 });
chartBars.forEach(bar => chartObserver.observe(bar));

// ================= MORTGAGE CALCULATOR =================
const calcPrice = document.getElementById('calcPrice');
const calcDown = document.getElementById('calcDown');
const calcRate = document.getElementById('calcRate');
const calcYears = document.getElementById('calcYears');

if (calcPrice && calcDown && calcRate && calcYears){
  const calcPriceVal = document.getElementById('calcPriceVal');
  const calcDownVal = document.getElementById('calcDownVal');
  const calcRateVal = document.getElementById('calcRateVal');
  const calcYearsVal = document.getElementById('calcYearsVal');
  const calcEmi = document.getElementById('calcEmi');
  const calcPrincipalEl = document.getElementById('calcPrincipal');
  const calcInterestEl = document.getElementById('calcInterest');
  const calcSplitPrincipal = document.getElementById('calcSplitPrincipal');

  function formatINR(num){
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  function updateCalculator(){
    const price = parseFloat(calcPrice.value);
    const downPct = parseFloat(calcDown.value);
    const rate = parseFloat(calcRate.value);
    const years = parseFloat(calcYears.value);

    const principal = price * (1 - downPct / 100);
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;

    let emi;
    if (monthlyRate === 0){
      emi = principal / months;
    } else {
      emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
            (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    calcPriceVal.textContent = formatINR(price);
    calcDownVal.textContent = downPct + '%';
    calcRateVal.textContent = rate.toFixed(1) + '%';
    calcYearsVal.textContent = years + ' yrs';

    calcEmi.textContent = formatINR(emi) + ' / mo';
    calcPrincipalEl.textContent = formatINR(principal);
    calcInterestEl.textContent = formatINR(totalInterest);

    const principalShare = (principal / totalPayment) * 100;
    calcSplitPrincipal.style.width = principalShare + '%';
  }

  [calcPrice, calcDown, calcRate, calcYears].forEach(input =>
    input.addEventListener('input', updateCalculator)
  );
  updateCalculator();
}

// ================= FAQ ACCORDION =================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const btn = item.querySelector('.faq-q');
  const panel = item.querySelector('.faq-a');

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    faqItems.forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      other.querySelector('.faq-a').style.maxHeight = null;
    });

    if (!isOpen){
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// ================= FORMS (demo only, no backend) =================
const searchFormEl = document.getElementById('searchForm');
if (searchFormEl){
  searchFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = document.getElementById('listings');
    if (target) target.scrollIntoView({ behavior:'smooth' });
  });
}

const ctaFormEl = document.getElementById('ctaForm');
if (ctaFormEl){
  ctaFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const original = btn.textContent;
    btn.textContent = 'Request sent';
    e.target.reset();
    setTimeout(() => { btn.textContent = original; }, 2600);
  });
}

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm){
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const icon = btn.querySelector('i');
    icon.className = 'fa-solid fa-check';
    e.target.reset();
    setTimeout(() => { icon.className = 'fa-solid fa-arrow-right'; }, 2600);
  });
}

// ================= BLOG CATEGORY FILTER =================
const filterBtns = document.querySelectorAll('.filter-btn');
const filterCards = document.querySelectorAll('[data-category]');

if (filterBtns.length && filterCards.length){
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      filterCards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        card.classList.toggle('hide', !match);
      });
    });
  });
}

// ================= BLOG PAGINATION (demo) =================
const pageBtns = document.querySelectorAll('.page-btn[data-page]');
if (pageBtns.length){
  pageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('next')){
        const active = document.querySelector('.page-btn.active');
        const next = active && active.nextElementSibling && active.nextElementSibling.dataset.page
          ? active.nextElementSibling : document.querySelector('.page-btn[data-page]');
        if (next) next.click();
        return;
      }
      pageBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const journal = document.getElementById('journal');
      if (journal) journal.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
}

// ================= CONTACT FORM (demo validation) =================
const contactForm = document.getElementById('contactForm');
if (contactForm){
  const successBox = document.getElementById('contactSuccess');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const label = btn.querySelector('.btn-label') || btn;
    const original = label.textContent;
    btn.disabled = true;
    label.textContent = 'Sending…';

    setTimeout(() => {
      btn.disabled = false;
      label.textContent = original;
      contactForm.reset();
      if (successBox){
        successBox.classList.add('show');
        setTimeout(() => successBox.classList.remove('show'), 4500);
      }
    }, 900);
  });
}

// ================= PASSWORD VISIBILITY TOGGLE =================
document.querySelectorAll('.field-icon-btn[data-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.toggle);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    const icon = btn.querySelector('i');
    icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  });
});

// ================= PASSWORD STRENGTH METER =================
const signupPassword = document.getElementById('signupPassword');
if (signupPassword){
  const bars = document.querySelectorAll('.auth-strength span');
  const label = document.getElementById('strengthLabel');

  signupPassword.addEventListener('input', () => {
    const val = signupPassword.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ['#3A4046', '#b05050', '#B08D57', '#7C9186', '#4B5D52'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    bars.forEach((bar, i) => {
      bar.style.background = i < score ? colors[score] : '#3A4046';
    });
    if (label) label.textContent = val ? labels[score] : '';
  });
}

// ================= LOGIN / SIGNUP SUBMIT (demo) =================
function handleAuthSubmit(formId, errorId, condition, errorMsg){
  const form = document.getElementById(formId);
  if (!form) return;
  const errorBox = document.getElementById(errorId);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (errorBox) errorBox.classList.remove('show');

    if (condition && !condition()){
      if (errorBox){
        errorBox.querySelector('span').textContent = errorMsg;
        errorBox.classList.add('show');
      }
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.classList.add('auth-btn-loading');
    setTimeout(() => {
      btn.classList.remove('auth-btn-loading');
      const label = btn.querySelector('.btn-label') || btn;
      const original = label.textContent;
      label.textContent = formId === 'loginForm' ? 'Welcome back' : 'Account created';
      setTimeout(() => { label.textContent = original; }, 2200);
    }, 1100);
  });
}

handleAuthSubmit('loginForm', 'loginError', () => {
  const email = document.getElementById('loginEmail');
  const pass = document.getElementById('loginPassword');
  return email && pass && email.value.includes('@') && pass.value.length >= 6;
}, 'Enter a valid email and a password of at least 6 characters.');

handleAuthSubmit('signupForm', 'signupError', () => {
  const email = document.getElementById('signupEmail');
  const pass = document.getElementById('signupPassword');
  const terms = document.getElementById('signupTerms');
  return email && pass && email.value.includes('@') && pass.value.length >= 8 && terms && terms.checked;
}, 'Check your email, use a password of 8+ characters, and accept the terms.');