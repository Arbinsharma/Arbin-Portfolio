import { db } from "./firebase-init.js";
import { doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function getDocData(coll, id) {
  try {
    const snap = await getDoc(doc(db, coll, id));
    return snap.exists() ? snap.data() : null;
  } catch(e){ console.warn("firestore read:", coll + '/' + id, e.message); return null; }
}

export async function getProjects() {
  try {
    const snap = await getDocs(query(collection(db, "projects"), orderBy("order", "asc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e){ console.warn("firestore projects:", e.message); return []; }
}

async function applyTheme() {
  try {
    const d = await getDocData("settings", "theme");
    if (!d) return;
    const r = document.documentElement;
    if (d.accent) r.style.setProperty('--cyan', d.accent);
    if (d.brandName) document.querySelectorAll('[data-brand]').forEach(el => el.textContent = d.brandName);
    if (d.metaTitle) document.title = d.metaTitle;
  } catch(e){}
}
async function applySections() {
  try {
    const d = await getDocData("settings", "sections");
    if (!d) return;
    document.querySelectorAll('[data-section]').forEach(el => {
      const k = el.dataset.section;
      el.style.display = d[k] === false ? 'none' : '';
    });
  } catch(e){}
}
async function applyCustomCss() {
  try {
    const d = await getDocData("settings", "customcss");
    if (!d || !d.css) return;
    let tag = document.getElementById('custom-css');
    if (!tag) { tag = document.createElement('style'); tag.id = 'custom-css'; document.head.appendChild(tag); }
    tag.textContent = d.css;
  } catch(e){}
}

export async function loadHero() {
  await applyTheme();
  const d = await getDocData("content", "hero");
  if (!d) return;
  const set = (sel, v) => document.querySelectorAll(sel).forEach(el => { if (v != null && v !== '') el.textContent = v; });
  set("[data-hero-name]", d.name);
  set("[data-hero-avail]", d.availability);
  set("[data-hero-lede]", d.lede);
  set("[data-hero-role]", d.role);
  set("[data-hero-stack]", d.stack);
  if (d.photoUrl) document.querySelectorAll("[data-hero-photo]").forEach(img => img.src = d.photoUrl);
}

export async function loadHome() {
  await applySections();
  await applyCustomCss();
  const d = await getDocData("content", "home");
  if (!d) return;
  const set = (sel, v) => document.querySelectorAll(sel).forEach(el => { if (v != null && v !== '') el.textContent = v; });
  set("[data-home-work-eyebrow]", d.workEyebrow);
  set("[data-home-work-heading]", d.workHeading);
  set("[data-home-work-desc]", d.workDesc);
  set("[data-home-about-big]", d.aboutBig);
  set("[data-home-about-body]", d.aboutBody);
  set("[data-home-cta]", d.ctaHeading);
}

export async function loadAbout() {
  await applyTheme();
  await applyCustomCss();
  const d = await getDocData("content", "about");
  if (!d) return;
  const pw = document.querySelector("[data-about-paragraphs]");
  if (pw && d.paragraphs?.length) {
    pw.innerHTML = d.paragraphs.map(p => `<p class="reveal">${p}</p>`).join("");
    pw.querySelectorAll('.reveal').forEach(el => {
      new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: 0.15 }).observe(el);
    });
  }
  const sw = document.querySelector("[data-about-skills]");
  if (sw && d.skills?.length) sw.innerHTML = d.skills.map(s => `<li><span>${s}</span><span class="lvl">daily</span></li>`).join("");
}

export async function loadContact() {
  await applyTheme();
  await applyCustomCss();
  const d = await getDocData("content", "contact");
  if (!d) return;
  const m = document.querySelector("[data-contact-email]");
  if (m && d.email) { m.textContent = d.email; m.href = `mailto:${d.email}`; }
  const map = { github:"[data-contact-github]", linkedin:"[data-contact-linkedin]", twitter:"[data-contact-twitter]", instagram:"[data-contact-instagram]", resumeUrl:"[data-contact-resume]" };
  for (const k of Object.keys(map)) {
    const el = document.querySelector(map[k]);
    if (el && d[k]) el.href = d[k];
  }
}

export async function loadProjects(target) {
  const list = await getProjects();
  const wrap = document.querySelector(target);
  if (!wrap || !list.length) return;
  wrap.innerHTML = list.map((p, i) => `
    <a class="proj-row reveal" href="${p.link || '#'}" target="_blank" rel="noopener">
      <span class="pr-num">${String(i+1).padStart(2,'0')}</span>
      <span class="pr-main">
        <span class="pr-name">${p.title || ''}</span>
        <span class="pr-desc">${p.description || ''}</span>
      </span>
      <span class="pr-tags">${(p.tags||[]).map(t => `<span>${t}</span>`).join('')}</span>
      <span class="pr-year">${p.year||''}</span>
      <span class="pr-arrow">↗</span>
    </a>
  `).join("");
  wrap.querySelectorAll('.reveal').forEach(el => {
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: 0.1 }).observe(el);
  });
}

export async function loadFooter() {
  const d = await getDocData("content", "footer");
  if (!d) return;
  document.querySelectorAll("[data-footer-sig]").forEach(el => { if (d.signature) el.textContent = d.signature; });
  document.querySelectorAll("[data-footer-copy]").forEach(el => { if (d.copy) el.textContent = d.copy; });
}
