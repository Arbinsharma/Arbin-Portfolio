/* page transition */
const pt = document.getElementById('pt');
window.addEventListener('load', () => { if (pt) pt.classList.remove('on'); });

document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a || !a.href) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && !url.hash) return;
  if (a.target === '_blank' || e.metaKey || e.ctrlKey) return;
  if (a.getAttribute('href')?.startsWith('#')) return;
  e.preventDefault();
  pt?.classList.add('on');
  setTimeout(() => location.href = a.href, 360);
});

/* active nav link */
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav .lnk, .mobile-menu a').forEach(l => {
  const h = l.getAttribute('href');
  if (h === path || (path === '' && h === 'index.html')) l.classList.add('active');
});

/* nav scrolled state */
const nav = document.querySelector('nav.top');
function checkNav(){
  if (!nav) return;
  if (window.scrollY > 8) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}
addEventListener('scroll', checkNav, { passive:true });
checkNav();

/* mobile menu */
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('on');
  });
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      mobileMenu.classList.remove('on');
    }
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('on'));
  });
}

/* reveal */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* stagger children */
document.querySelectorAll('[data-stagger]').forEach(parent => {
  const kids = parent.children;
  [...kids].forEach((k, i) => {
    k.style.opacity = '0';
    k.style.transform = 'translateY(14px)';
    k.style.transition = `opacity .7s cubic-bezier(.16,1,.3,1) ${i * .06}s, transform .7s cubic-bezier(.16,1,.3,1) ${i * .06}s`;
  });
  requestAnimationFrame(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          [...kids].forEach(k => { k.style.opacity = '1'; k.style.transform = 'none'; });
          obs.disconnect();
        }
      });
    }, { threshold: 0.1 });
    obs.observe(parent);
  });
});
