import { db } from "./firebase-init.js";
import { doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function getContent(key) {
  const snap = await getDoc(doc(db, "content", key));
  return snap.exists() ? snap.data() : null;
}

export async function getProjects() {
  const q = query(collection(db, "projects"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function loadHero() {
  const d = await getContent("hero");
  if (!d) return;
  const set = (sel, val) => { const el = document.querySelector(sel); if (el && val != null) el.textContent = val; };
  set("[data-hero-name]", d.name);
  set("[data-hero-tagline]", d.tagline);
  set("[data-hero-lede]", d.lede);
  set("[data-hero-availability]", d.availability);
}

export async function loadAbout() {
  const d = await getContent("about");
  if (!d) return;
  const pWrap = document.querySelector("[data-about-paragraphs]");
  if (pWrap && d.paragraphs?.length) {
    pWrap.innerHTML = d.paragraphs.map(p => `<p class="reveal">${p}</p>`).join("");
    pWrap.querySelectorAll(".reveal").forEach(el => {
      new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); } }), { threshold: 0.15 }).observe(el);
    });
  }
  const sWrap = document.querySelector("[data-about-skills]");
  if (sWrap && d.skills?.length) {
    sWrap.innerHTML = d.skills.map(s => `<span class="chip">${s}</span>`).join("");
  }
}

export async function loadContact() {
  const d = await getContent("contact");
  if (!d) return;
  const mail = document.querySelector("[data-contact-email]");
  if (mail && d.email) { mail.textContent = d.email; mail.href = `mailto:${d.email}`; }
  const g = document.querySelector("[data-contact-github]"); if (g && d.github) g.href = d.github;
  const l = document.querySelector("[data-contact-linkedin]"); if (l && d.linkedin) l.href = d.linkedin;
  const r = document.querySelector("[data-contact-resume]"); if (r && d.resumeUrl) r.href = d.resumeUrl;
}

export async function loadProjects(target) {
  const list = await getProjects();
  const wrap = document.querySelector(target);
  if (!wrap) return;
  if (!list.length) { wrap.innerHTML = `<p class="lede">no projects yet — add some in the admin panel.</p>`; return; }
  wrap.innerHTML = list.map((p, i) => `
    <article class="card reveal" style="transition-delay:${i * 80}ms">
      ${p.imageUrl ? `<div style="aspect-ratio:16/9;border-radius:14px;overflow:hidden;margin-bottom:20px;background:#0a0d16"><img src="${p.imageUrl}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover"/></div>` : ""}
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:14px">
        <div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--a1);letter-spacing:.12em;margin-bottom:8px">${String(i+1).padStart(2,'0')}</div>
          <h3>${p.title}</h3>
        </div>
        ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" style="color:var(--dim);font-size:18px;transition:color .2s" onmouseover="this.style.color='var(--a1)'" onmouseout="this.style.color='var(--dim)'">↗</a>` : ""}
      </div>
      <p style="color:var(--dim);font-size:14px;line-height:1.65;margin-bottom:18px">${p.description || ""}</p>
      ${p.tags?.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap">${p.tags.map(t => `<span class="chip">${t}</span>`).join("")}</div>` : ""}
    </article>
  `).join("");
  wrap.querySelectorAll(".reveal").forEach(el => {
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); } }), { threshold: 0.1 }).observe(el);
  });
}
