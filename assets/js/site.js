/* ============================================================================
   AAR — site chrome (shared by index.html and search.html)
   Theme toggle · rail scroll-spy · copy controls · live health indicator.
   No framework. Progressive: everything works without JS except the live chip.
   ========================================================================= */

import { health, ApiError } from "./api.js?v=9";
import { isConfigured } from "./config.js?v=9";

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

/* ---- Nerd mode ------------------------------------------------------------ */
/* Off by default: technical surfaces stay in the DOM but hidden via CSS.
   On: endpoints, schemas, request previews and API links come back.        */

const NERD_KEY = "aar.nerd";


function applyNerd(mode) {
  const on = mode === "on";
  document.documentElement.setAttribute("data-nerd", on ? "on" : "off");
  for (const btn of document.querySelectorAll("[data-nerd-toggle]")) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("title", on
      ? "Nerd mode is on: endpoints, schemas and request details are visible"
      : "Nerd mode is off: technical details are hidden");
    const label = btn.querySelector("[data-nerd-label]");
    if (label && btn.classList.contains("nerd-toggle")) {
      label.textContent = on ? "Nerd: on" : "Nerd: off";
    }
  }
  if (on) {
    checkHealth();
  }
}

function initNerd() {
  let saved = null;
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get("nerd") === "1" || p.get("nerd") === "on" || p.get("nerd") === "true") {
      localStorage.setItem(NERD_KEY, "on");
    }
    saved = localStorage.getItem(NERD_KEY);
  } catch { /* ignore */ }
  const isApi = window.location.pathname.includes("/api");
  applyNerd(saved === "on" || (saved !== "off" && isApi) ? "on" : "off");

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nerd-toggle]");
    if (!btn) return;
    const next = document.documentElement.getAttribute("data-nerd") === "on" ? "off" : "on";
    try { localStorage.setItem(NERD_KEY, next); } catch { /* ignore */ }
    applyNerd(next);
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
    const btn = e.target.closest("[data-copy], [data-copy-text]");
    if (!btn) return;
    e.preventDefault();

    let text = btn.getAttribute("data-copy-text");
    if (!text) {
      const sel = btn.getAttribute("data-copy");
      if (sel) {
        try {
          const src = document.querySelector(sel);
          if (src) text = src.innerText || src.textContent || "";
        } catch (_) {
          text = sel;
        }
        if (!text) text = sel;
      }
    }

    if (!text) return;
    const ok = await copyText(text.trim());
    const label = btn.querySelector("[data-copy-label]") || btn;
    const was = label.textContent;
    label.textContent = ok ? "Copied" : "Copy failed";
    btn.setAttribute("data-copied", ok ? "true" : "false");
    setTimeout(() => { label.textContent = was; btn.removeAttribute("data-copied"); }, 1600);
  });
}

/* ---- Live health chip ----------------------------------------------------- */

const HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000; // Poll every 5 minutes

async function checkHealth() {
  const chips = document.querySelectorAll("[data-health]");
  if (!chips.length) return;
  const setText = (t, state) => {
    const time = new Date().toLocaleTimeString();
    for (const chip of chips) {
      chip.textContent = t;
      chip.setAttribute("data-state", state);
      chip.setAttribute("title", `${t} (checked: ${time})`);
    }
  };

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const h = await health(ctrl.signal);
    const status = typeof h?.status === "string" ? h.status.toLowerCase() : "";
    const isOk = status === "ok" || status === "healthy" || status === "live";
    if (isOk) {
      setText("Online", "ok");
    } else {
      setText("Error", "error");
    }
  } catch (err) {
    setText("Offline", "error");
  } finally {
    clearTimeout(t);
  }
}

async function initHealth() {
  // Immediate check in background on page load regardless of nerd mode
  checkHealth();

  // Periodic recurring check every 5 minutes
  setInterval(() => {
    checkHealth();
  }, HEALTH_CHECK_INTERVAL_MS);

  // Re-check when window/tab regains focus if more than 60s elapsed
  let lastChecked = Date.now();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && (Date.now() - lastChecked > 60000)) {
      lastChecked = Date.now();
      checkHealth();
    }
  });
}

/* ---- Boot ----------------------------------------------------------------- */


/* ---- Sidebar Drawer & Theme Switcher ------------------------------------- */

function initDrawer() {
  const drawer = document.querySelector("[data-drawer]");
  const backdrop = document.querySelector("[data-drawer-backdrop]");
  const openBtns = document.querySelectorAll("[data-drawer-open]");
  const closeBtns = document.querySelectorAll("[data-drawer-close]");

  function openMenu() {
    if (!drawer || !backdrop) return;
    drawer.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
      openBtns.forEach(b => b.setAttribute("aria-expanded", "true"));
    });
  }

  function closeMenu() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
    openBtns.forEach(b => b.setAttribute("aria-expanded", "false"));
    setTimeout(() => {
      if (!drawer.classList.contains("is-open")) {
        drawer.hidden = true;
        backdrop.hidden = true;
      }
    }, 280);
  }

  openBtns.forEach(b => b.addEventListener("click", openMenu));
  closeBtns.forEach(b => b.addEventListener("click", closeMenu));
  if (backdrop) backdrop.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) {
      closeMenu();
    }
  });

  // Clicking a drawer nav link closes the drawer
  if (drawer) {
    drawer.querySelectorAll(".drawer-link").forEach(link => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });
  }

  // Click listener for Sun / Moon theme icon buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-set-theme]");
    if (!btn) return;
    const target = btn.getAttribute("data-set-theme");
    try { localStorage.setItem(THEME_KEY, target); } catch { /* ignore */ }
    applyTheme(target);
  });
}

function boot() {
  initTheme();
  initHealth();
  initNerd();
  initRail();
  initCopy();
  initDrawer();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
