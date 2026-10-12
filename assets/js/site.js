/* ============================================================================
   AAR — site chrome (shared by index.html and search.html)
   Theme toggle · rail scroll-spy · copy controls · live health indicator.
   No framework. Progressive: everything works without JS except the live chip.
   ========================================================================= */

import { health, ApiError } from "./api.js";
import { isConfigured } from "./config.js";

/* ---- Theme ---------------------------------------------------------------- */

const THEME_KEY = "aar.theme";

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
  const btn = document.querySelector("[data-theme-toggle]");
  if (btn) {
    btn.textContent = theme === "dark" ? "Ink-dark" : "Light";
    btn.setAttribute("aria-label",
      theme === "dark" ? "Switch to the light printing" : "Switch to the ink-dark printing");
  }
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
  if (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    saved = "dark";
  }
  applyTheme(saved === "dark" ? "dark" : "light");

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    const next = document.documentElement.hasAttribute("data-theme") ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    applyTheme(next);
  });
}

/* ---- Rail scroll-spy ------------------------------------------------------ */

function initRail() {
  const links = Array.from(document.querySelectorAll(".rail__list a[href^='#']"));
  if (!links.length) return;
  const map = new Map();
  for (const a of links) {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) map.set(el, a);
  }
  if (!map.size) return;

  const set = (a) => {
    for (const link of links) link.removeAttribute("aria-current");
    if (a) a.setAttribute("aria-current", "true");
  };

  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) set(map.get(visible[0].target));
  }, { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] });

  for (const el of map.keys()) io.observe(el);
}

/* ---- Copy controls -------------------------------------------------------- */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}

function initCopy() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const sel = btn.getAttribute("data-copy");
    const src = sel ? document.querySelector(sel) : null;
    const text = btn.getAttribute("data-copy-text") || (src ? src.textContent : "");
    const ok = await copyText(text);
    const label = btn.querySelector("[data-copy-label]") || btn;
    const was = label.textContent;
    label.textContent = ok ? "Copied" : "Copy failed";
    btn.setAttribute("data-copied", ok ? "true" : "false");
    setTimeout(() => { label.textContent = was; btn.removeAttribute("data-copied"); }, 1600);
  });
}

/* ---- Live health chip ----------------------------------------------------- */

async function initHealth() {
  const chip = document.querySelector("[data-health]");
  if (!chip) return;
  const setText = (t, state) => {
    chip.textContent = t;
    chip.setAttribute("data-state", state);
    chip.setAttribute("title", t);
  };

  if (!isConfigured()) { setText("No backend configured", "idle"); return; }
  setText("Checking endpoint…", "idle");

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const h = await health(ctrl.signal);
    const status = typeof h?.status === "string" ? h.status : "live";
    setText(`Endpoint ${status}`, "ok");
  } catch (err) {
    const e = err instanceof ApiError ? err : null;
    setText(e && e.status === 401 ? "Endpoint reachable · key rejected" : "Endpoint unreachable",
            e && e.status === 401 ? "warn" : "error");
  } finally {
    clearTimeout(t);
  }
}

/* ---- Boot ----------------------------------------------------------------- */

function boot() {
  initTheme();
  initRail();
  initCopy();
  initHealth();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
