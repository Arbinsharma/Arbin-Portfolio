/* ─── active nav ─── */
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav .lnk, .mobile-menu a').forEach(l => {
  const h = l.getAttribute('href');
  if (h === path || (path === '' && h === 'index.html')) l.classList.add('active');
});

/* ─── nav scrolled ─── */
const nav = document.querySelector('nav.top');
function checkNav(){ nav?.classList.toggle('scrolled', window.scrollY > 8); }
addEventListener('scroll', checkNav, { passive:true }); checkNav();

/* ─── mobile menu ─── */
const mb = document.querySelector('.menu-btn');
const mm = document.querySelector('.mobile-menu');
if (mb && mm) {
  mb.onclick = (e) => { e.stopPropagation(); mm.classList.toggle('on'); };
  document.addEventListener('click', (e) => {
    if (!mm.contains(e.target) && !mb.contains(e.target)) mm.classList.remove('on');
  });
  mm.querySelectorAll('a').forEach(a => a.onclick = () => mm.classList.remove('on'));
}

/* ─── reveals ─── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ─── stagger ─── */
document.querySelectorAll('[data-stagger]').forEach(parent => {
  [...parent.children].forEach((k, i) => {
    k.style.opacity = '0';
    k.style.transform = 'translateY(16px)';
    k.style.transition = `opacity .8s cubic-bezier(.2,.8,.2,1) ${i * .07}s, transform .8s cubic-bezier(.2,.8,.2,1) ${i * .07}s`;
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        [...parent.children].forEach(k => { k.style.opacity = '1'; k.style.transform = 'none'; });
        obs.disconnect();
      }
    });
  }, { threshold: 0.12 });
  obs.observe(parent);
});

/* ─── count up ─── */
document.querySelectorAll('[data-count]').forEach(el => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now(), dur = 1400;
      const isFloat = target % 1 !== 0;
      (function step(now){
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (isFloat ? (target * eased).toFixed(1) : Math.round(target * eased)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: 0.3 });
  obs.observe(el);
});
